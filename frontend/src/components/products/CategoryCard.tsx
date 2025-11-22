import { theme } from '../../styles/theme';

interface CategoryCardProps {
    category: string;
    itemCount: number;
    colorIndex: number;
    onClick: () => void;
}

const CategoryCard = ({ category, itemCount, colorIndex, onClick }: CategoryCardProps) => {
    // Lighter pastel colors based on Image 0
    const colors = [
        '#E3F4F6', // Light Blue (Beer)
        '#DDFBE8', // Light Green (Wines)
        '#FCFACC', // Light Yellow (Cocktails)
        '#FBEBD9', // Light Orange (Spirits)
        '#E3F4F6', // Light Teal (Signature)
        '#F0E6FA', // Light Purple (Non-alcoholic)
    ];

    const backgroundColor = colors[colorIndex % colors.length];

    // Text color for "X items" - using a teal/green shade
    const countColor = '#4A9CA6';

    return (
        <button
            onClick={onClick}
            style={{
                backgroundColor,
                borderRadius: '12px',
                padding: '20px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start', // Align to top
                minHeight: '140px', // Taller card
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadows.medium;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
            className="no-select"
        >
            <div
                style={{
                    ...theme.typography.headingH4, // Larger, bolder title
                    textAlign: 'left',
                    textTransform: 'capitalize',
                    color: '#193238', // Darker text
                    marginBottom: '4px',
                    fontSize: '20px',
                    fontWeight: 700,
                }}
            >
                {category}
            </div>
            <div
                style={{
                    ...theme.typography.caption1,
                    color: countColor,
                    fontWeight: 600,
                    fontSize: '13px',
                }}
            >
                {itemCount} items
            </div>
        </button>
    );
};

export default CategoryCard;
