import { NextRequest, NextResponse } from "next/server";
import { getDb, AuditLedgerRow } from "@/lib/db";
import { verifyChainIntegrity, generateProofOfGateExecution } from "@/lib/crypto";
import { recourseStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const db = getDb();
    
    // Fetch Merkle cryptographic audit ledger
    const merkleNodes = db.prepare(`
      SELECT * FROM audit_ledger 
      ORDER BY node_index DESC 
      LIMIT ? OFFSET ?
    `).all(limit, offset) as AuditLedgerRow[];

    const totalMerkle = db.prepare('SELECT COUNT(*) as count FROM audit_ledger').get() as { count: number };

    // Run full cryptographic chain verification
    const chainIntegrity = verifyChainIntegrity();

    // Map nodes with PGE tokens
    const enrichedNodes = merkleNodes.map(node => {
      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(node.payload_json);
      } catch {
        parsedPayload = { raw: node.payload_json };
      }

      return {
        node_index: node.node_index,
        previous_hash: node.previous_hash,
        node_hash: node.node_hash,
        payload: parsedPayload,
        signature: node.signature,
        timestamp: node.timestamp,
        pge_token: generateProofOfGateExecution(parsedPayload, node.node_hash),
      };
    });

    // Also include legacy store items for UI backward compatibility
    const auditData = recourseStore.getAuditLog(limit, offset);
    const transactions = recourseStore.getAllTransactions();

    return NextResponse.json({
      success: true,
      merkle_chain: enrichedNodes,
      total_merkle_nodes: totalMerkle.count,
      chain_integrity: chainIntegrity,
      // Backward compatibility fields:
      entries: auditData.entries,
      total: auditData.total,
      transactions: transactions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching audit ledger:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptographic audit ledger", details: error.message },
      { status: 500 }
    );
  }
}
