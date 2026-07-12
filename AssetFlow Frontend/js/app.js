// ============================================
// AssetFlow — App Bootstrap
// ============================================

const App = {
  async init() {
    console.log('AssetFlow: Initializing...');

    // Seed data on first run
    await SeedData.seed();

    // Initialize router
    Router.init();

    console.log('AssetFlow: Ready.');
  }
};

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
