import { theme } from '../styles/theme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../backend/convex/_generated/api';
import BevProLogo from '../components/common/BevProLogo';
import type { Id } from '../../../backend/convex/_generated/dataModel';
import { useMediaQuery } from '../hooks/useMediaQuery';

const TransactionsScreen = () => {
    const transactions = useQuery(api.orders.listCompletedOrders, { limit: 50 }) || [];
    const isCompact = useMediaQuery('(max-width: 1024px)');
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
            minHeight: '100%',
            backgroundColor: theme.brand.backgroundColor,
            display: 'flex',
            flexDirection: 'column',
            padding: isCompact ? '16px' : '24px',
            gap: isCompact ? '16px' : '24px',
            overflow: isCompact ? 'visible' : 'hidden'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isCompact ? 'column' : 'row',
                alignItems: isCompact ? 'flex-start' : 'center',
                justifyContent: isCompact ? 'flex-start' : 'space-between',
                gap: isCompact ? '12px' : '0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <BevProLogo width={isCompact ? 90 : 110} color={theme.blue[400]} />
                    <h1 style={{
                        ...theme.typography.headingH2,
                        color: theme.neutral[900],
                        margin: 0,
                        fontSize: isCompact ? '24px' : theme.typography.headingH2.fontSize
                    }}>
                        Transactions
                    </h1>
                </div>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    width: isCompact ? '100%' : 'auto'
                }}>
                    <button
                        onClick={handleEmailReport}
                        style={{
                            backgroundColor: theme.neutral[200],
                            color: theme.neutral[800],
                            border: 'none',
                            borderRadius: '8px',
                            padding: isCompact ? '10px 16px' : '10px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            flex: isCompact ? '1' : '0'
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
                            padding: isCompact ? '10px 16px' : '10px 20px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            flex: isCompact ? '1' : '0'
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
                {!isCompact && (
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
                )}

                {/* Table Body */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {transactions.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: theme.neutral[500] }}>
                            No transactions found.
                        </div>
                    ) : (
                        transactions.map((order: any) => {
                            if (isCompact) {
                                return (
                                    <div
                                        key={order._id}
                                        style={{
                                            backgroundColor: theme.neutral[0],
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.neutral[200]}`,
                                            padding: '16px',
                                            marginBottom: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            boxShadow: theme.shadows.small
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 600, color: theme.neutral[900] }}>
                                                {order.order_name || 'Walk-in'}
                                            </div>
                                            <span style={{ fontFamily: 'monospace', color: theme.neutral[400], fontSize: '12px' }}>
                                                #{order._id.slice(-6)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.neutral[600] }}>
                                            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>{order.items.length} items</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 700 }}> ${(order.total / 100).toFixed(2)}</span>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '999px',
                                                backgroundColor: theme.green[100],
                                                color: theme.green[800],
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                Completed
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleVoid(order._id)}
                                            style={{
                                                alignSelf: 'flex-end',
                                                backgroundColor: '#FEE2E2',
                                                color: theme.red[600],
                                                border: `1px solid ${theme.red[300]}`,
                                                borderRadius: '8px',
                                                padding: '6px 14px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Void Transaction
                                        </button>
                                    </div>
                                );
                            }

                            return (
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
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionsScreen;
