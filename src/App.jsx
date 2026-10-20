import { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NEW: Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      });
  }, []);

  // 2. Handle Filters (Category + Search combined)
  useEffect(() => {
    let result = products;

    // Apply Category Filter
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // Apply Search Filter
    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [category, searchQuery, products]);

  // 3. Cart Logic
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, amount) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  // NEW: Remove Item Function
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // NEW: Handle Checkout
  const handleCheckout = () => {
    setIsCheckoutOpen(true); // Open modal
    setCart([]); // Clear cart
    setIsCartOpen(false); // Close cart drawer
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">ShopFake.</h1>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Search and Filters Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {['all', 'electronics', 'jewelery', "men's clothing", "women's clothing"].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium capitalize border ${
                  category === cat 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* NEW: Search Bar */}
          <div className="w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20 text-xl font-semibold text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-xl font-semibold text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col h-full hover:shadow-md transition">
                <div className="h-48 flex items-center justify-center mb-4 bg-white p-2">
                  <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
                <h3 className="font-bold text-gray-800 line-clamp-2 mb-2 flex-grow">{product.title}</h3>
                <p className="text-sm text-gray-500 capitalize mb-2">{product.category}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <div className={`fixed inset-0 z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
        
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold">Your Cart ({totalItems})</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black text-2xl font-bold">&times;</button>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-contain bg-gray-50 rounded p-1" />
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                      <p className="text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="bg-gray-200 px-2 rounded hover:bg-gray-300">-</button>
                          <span className="font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="bg-gray-200 px-2 rounded hover:bg-gray-300">+</button>
                        </div>
                        {/* NEW: Remove Button */}
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-black text-blue-600">${calculateTotal()}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-lg font-bold transition ${cart.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Checkout
            </button>
          </div>

        </div>
      </div>

      {/* NEW: Checkout Success Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Successful!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase. Your simulated order has been confirmed.</p>
            <button 
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;