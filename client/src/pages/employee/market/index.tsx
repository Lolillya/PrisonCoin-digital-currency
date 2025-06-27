import { useState, useEffect } from 'react';
import { getAvailableItems, MarketItem } from '../../../api/market';
import { MarketItemCard } from '../../../components/ui/market-item-card';

const MarketPage = () => {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [inmateAddress, setInmateAddress] = useState('');
    const [purchaseStatus, setPurchaseStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    // Categories for filtering
    const categories = ['all', 'food', 'communication', 'entertainment', 'personal care', 'fitness'];

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [items, searchTerm, selectedCategory]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAvailableItems();
            setItems(response.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = items;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item =>
                item.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredItems(filtered);
    };

    const handlePurchaseSuccess = (transactionHash: string) => {
        setPurchaseStatus({
            type: 'success',
            message: `Purchase successful! Transaction hash: ${transactionHash.slice(0, 10)}...`
        });
        setTimeout(() => setPurchaseStatus({ type: null, message: '' }), 5000);
    };

    const handlePurchaseError = (errorMessage: string) => {
        setPurchaseStatus({
            type: 'error',
            message: errorMessage
        });
        setTimeout(() => setPurchaseStatus({ type: null, message: '' }), 5000);
    };

    if (loading) {
        return (
            <section className="section-container">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-highlight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-text/80">Loading market items...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="section-container">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-alert text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-text mb-2">Error Loading Market</h2>
                        <p className="text-text/80 mb-4">{error}</p>
                        <button
                            onClick={fetchItems}
                            className="bg-highlight hover:bg-highlight/80 text-text font-medium py-2 px-4 rounded-md transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section-container overflow-y-scroll flex flex-col gap-4">
            {/* Header */}
            {/* <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">Prison Market</h1>
                <p className="text-text/80">Browse and purchase items for inmates using ETH</p>
            </div> */}

            {/* Market Stats */}
            <div className=" bg-white/10 backdrop-blur-md flex flex-col gap-4  rounded-lg shadow-md p-6 border border-border/20">
                <h2 className="text-lg font-semibold text-text text-center border-b border-border/20 pb-4">Market Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-text">{items.length}</div>
                        <div className="text-sm text-text/60">Total Items</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-text">
                            {categories.length - 1}
                        </div>
                        <div className="text-sm text-text/60">Categories</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-text">
                            {items.reduce((min, item) => Math.min(min, item.costInEth), Infinity).toFixed(4)}
                        </div>
                        <div className="text-sm text-text/60">Lowest Price (ETH)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-text">
                            {items.reduce((max, item) => Math.max(max, item.costInEth), 0).toFixed(4)}
                        </div>
                        <div className="text-sm text-text/60">Highest Price (ETH)</div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            {purchaseStatus.type && (
                <div className={`mb-6 p-4 rounded-md ${
                    purchaseStatus.type === 'success' 
                        ? 'bg-success/20 border border-success text-success' 
                        : 'bg-alert/20 border border-alert text-alert'
                }`}>
                    {purchaseStatus.message}
                </div>
            )}

            

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-text/40 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-text mb-2">No items found</h3>
                    <p className="text-text/60">Try adjusting your search or filter criteria</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                        <MarketItemCard
                            key={item.id}
                            item={item}
                            inmateAddress={inmateAddress}
                            onPurchaseSuccess={handlePurchaseSuccess}
                            onPurchaseError={handlePurchaseError}
                        />
                    ))}
                </div>
            )}

            
        </section>
    );
};

export default MarketPage;