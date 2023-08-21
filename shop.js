// global state
document.addEventListener('alpine:init', () => {
    Alpine.data('shop', () => ({
        catalog: [],
        cart_items: [],
        cart_totals: {
            quantity: 0,
            total: 0,
        },

        init() {
            this.catalog = getProducts();
            this.restoreCart();
        },

        updateQuantity(item, value = 1) {
            value = value | 0;
            item.quantity += value;
            item.quantity = Math.max(0, item.quantity);
        },

        addCartItem(product) {
            if (product.quantity <= 0) {
                return this.removeCartItem(product.id);
            }
            let index = this.findCartItem(product.id);
            if (false === index) {
                index = this.cart_items.push(copy(product)) - 1;
            }
            this.cart_items[index].quantity = Math.max(1, product.quantity);
            this.calculateTotals();
        },

        removeCartItem(productId) {
            this.cart_items = this.cart_items.filter((item) => {
                return item.id !== productId;
            });
            this.calculateTotals();
        },

        findCartItem(id) {
            for (let i = 0; i < this.cart_items.length; i++) {
                if (this.cart_items[i].id === id) return i;
            }
            return false;
        },

        clearCart() {
            this.cart_items = [];
            this.calculateTotals();
        },

        calculateTotals() {
            // reseta
            this.cart_totals.quantity = 0;
            this.cart_totals.total = 0;
            // calcula novamente
            for (let i = 0; i < this.cart_items.length; i++) {
                const item = this.cart_items[i];
                this.cart_totals.quantity += item.quantity;
                this.cart_totals.total += item.quantity * item.price;
            }
            this.updateStorage();
        },

        updateStorage() {
            const items = this.serializeCart();
            localStorage.setItem('shop_cart_items', JSON.stringify(items));
            console.log('local storage updated');
        },

        restoreCart() {
            const stored = localStorage.getItem('shop_cart_items');
            if (!stored) return;

            const items = JSON.parse(stored);
            for (const product of this.catalog) {
                if (!items[product.id]) continue;
                product.quantity = items[product.id];
                this.addCartItem(product);
            }
        },

        serializeCart() {
            const items = {};
            for (let i = 0; i < this.cart_items.length; i++) {
                const item = this.cart_items[i];
                items[item.id] = item.quantity;
            }
            return items;
        },

        sync() {
            const items = this.serializeCart();
            for (const product of this.catalog) {
                if (!items[product.id]) continue;
                product.quantity = items[product.id];
            }
        },
    }));
});

function formatPrice(price) {
    return 'R$ ' + (price || 0).toFixed(2).replace('.', '.');
}

function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getProducts() {
    return [
        {
            id: 1,
            image: 'image.jpg',
            name: 'Produto 1',
            price: 10,
            quantity: 0,
        },
        {
            id: 2,
            image: 'image.jpg',
            name: 'Produto 2',
            price: 50,
            quantity: 0,
        },
    ];
}
