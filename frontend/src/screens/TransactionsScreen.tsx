import { theme } from '../styles/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import BevProLogo from '../components/common/BevProLogo';
import type { Id } from '../../../backend/convex/_generated/dataModel';

const TransactionsScreen = () => {
    const transactions = useQuery(api.orders.listCompletedOrders, { limit: 50 }) || [];
    const voidOrder = useMutation(api.orders.voidOrder);

    const handleVoid = async (orderId: Id<"orders">) => {
        if (window.confirm('Are you sure you want to void this transaction? This action cannot be undone.')) {
            await voidOrder({ orderId });
        }
    };

    const handleCloseVenue = () => {
        if (window.confirm('Are you sure you want to close the venue? This will generate end-of-day reports.')) {
            alert('Venue closed. Reports generated and sent.');
        }
    };

    const handleEmailReport = () => {
        const email = prompt('Enter email address for report:');
        if (email) {
            alert(`Report sent to ${email}`);
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.brand.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BevProLogo width={110} color={theme.blue[400]} />
                    <h1 style={{ ...theme.typography.headingH2, color: theme.neutral[900], margin: 0 }}>Transactions</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleEmailReport}
                        style={{
                            backgroundColor: theme.neutral[200],
                            color: theme.neutral[800],
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Email Report
                    </button>
                    <button
                        onClick={handleCloseVenue}
                        style={{
                            backgroundColor: theme.brand.pine,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Close Venue
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div style={{
                flex: 1,
                backgroundColor: theme.neutral[0],
                borderRadius: '12px',
                boxShadow: theme.shadows.small,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 100px',
                    padding: '16px 24px',
                    borderBottom: `1px solid ${theme.neutral[200]}`,
                    backgroundColor: theme.neutral[100],
                    fontWeight: 600,
                    color: theme.neutral[600],
                    fontSize: '14px'
                }}>
                    <div>Time</div>
                    <div>Order ID</div>
                    <div>Customer</div>
                    <div>Items</div>
                    <div>Total</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>

                {/* Table Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {transactions.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.neutral[500] }}>
                            No transactions found.
                        </div>
                    ) : (
                        transactions.map((order: any) => (
                            <div key={order._id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 1fr 1fr 100px',
                                padding: '16px 24px',
                                borderBottom: `1px solid ${theme.neutral[100]}`,
                                alignItems: 'center',
                                fontSize: '14px',
                                color: theme.neutral[800]
                            }}>
                                <div>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <div style={{ fontFamily: 'monospace', color: theme.neutral[500] }}>{order._id.slice(-8)}</div>
                                <div style={{ fontWeight: 500 }}>{order.order_name || 'Walk-in'}</div>
                                <div>{order.items.length} items</div>
                                <div style={{ fontWeight: 600 }}>${(order.total / 100).toFixed(2)}</div>
                                <div>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: theme.green[100],
                                        color: theme.green[800],
                                        fontSize: '12px',
                                        fontWeight: 500
                                    }}>
                                        Completed
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleVoid(order._id)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: theme.red[600],
                                            border: `1px solid ${theme.red[200]}`,
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Void
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionsScreen;
