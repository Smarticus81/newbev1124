import { theme } from '../../styles/theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const Header = () => {
    const isCompact = useMediaQuery('(max-width: 768px)');

    return (
        <div style={{
            height: isCompact ? '52px' : '60px',
            backgroundColor: theme.neutral[0],
            borderBottom: `1px solid ${theme.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isCompact ? '0 16px' : '0 24px',
            zIndex: 100,
        }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <span style={{
                    ...theme.typography.subheadText,
                    color: theme.neutral[900],
                    fontWeight: 600,
                    fontSize: isCompact ? '14px' : theme.typography.subheadText.fontSize
                }}>
                    The Grand Hall
                </span>
                {!isCompact && (
                    <>
                        <span style={{ width: '1px', height: '16px', backgroundColor: theme.neutral[300] }} />
                        <span style={{ ...theme.typography.subheadText, color: theme.neutral[600] }}>
                            Smith Wedding
                        </span>
                    </>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: isCompact ? '28px' : '32px',
                    height: isCompact ? '28px' : '32px',
                    borderRadius: '50%',
                    backgroundColor: theme.brand.pine,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: isCompact ? '12px' : '14px'
                }}>
                    JD
                </div>
                {!isCompact && (
                    <span style={{ ...theme.typography.caption1, color: theme.neutral[900], fontWeight: 500 }}>
                        John D.
                    </span>
                )}
            </div>
        </div>
    );
};

export default Header;
