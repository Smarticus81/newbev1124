import { theme } from '../../styles/theme';

const Header = () => {
    return (
        <div style={{
            height: '60px',
            backgroundColor: theme.neutral[0],
            borderBottom: `1px solid ${theme.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            zIndex: 100,
        }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <span style={{ ...theme.typography.subheadText, color: theme.neutral[900], fontWeight: 600 }}>
                    The Grand Hall
                </span>
                <span style={{ width: '1px', height: '16px', backgroundColor: theme.neutral[300] }} />
                <span style={{ ...theme.typography.subheadText, color: theme.neutral[600] }}>
                    Smith Wedding
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: theme.brand.pine,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px'
                }}>
                    JD
                </div>
                <span style={{ ...theme.typography.caption1, color: theme.neutral[900], fontWeight: 500 }}>
                    John D.
                </span>
            </div>
        </div>
    );
};

export default Header;
