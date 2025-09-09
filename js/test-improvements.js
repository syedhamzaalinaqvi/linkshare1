/**
 * Test script to verify all improvements are working correctly
 * This will be removed after testing - just for debugging
 */

// Test the search performance improvements
function testSearchPerformance() {
    console.log('🧪 Testing search performance improvements...');
    
    // Test if optimized search function exists
    if (typeof window.loadGroupsOptimized === 'function') {
        console.log('✅ Optimized loader function found');
    } else {
        console.log('❌ Optimized loader function NOT found');
    }
    
    // Test search with different scenarios
    if (window.loadGroupsOptimized) {
        // Test normal search
        setTimeout(() => {
            console.log('🔍 Testing normal search...');
            window.loadGroupsOptimized('all', 'all', 'test');
        }, 1000);
        
        // Test category filter
        setTimeout(() => {
            console.log('🏷️ Testing category filter...');
            window.loadGroupsOptimized('Movies', 'all', '');
        }, 3000);
        
        // Test both filters (the problematic one)
        setTimeout(() => {
            console.log('🎯 Testing combined filters (should NOT cause index error)...');
            window.loadGroupsOptimized('Movies', 'Pakistan', '');
        }, 5000);
    }
}

// Test loading message centering
function testLoadingMessages() {
    console.log('🧪 Testing loading message centering...');
    
    const testContainer = document.createElement('div');
    testContainer.style.width = '100%';
    testContainer.style.minHeight = '200px';
    testContainer.className = 'groups-grid';
    
    // Test different message types
    const messages = [
        '<div class="optimized-loading">Loading fresh groups...</div>',
        '<div class="no-groups">No groups found matching your search.<br><a href="/add-group">Add one!</a></div>',
        '<div class="error-state">Loading Error<br><button>Retry</button></div>'
    ];
    
    messages.forEach((message, index) => {
        setTimeout(() => {
            testContainer.innerHTML = message;
            console.log(`📱 Message ${index + 1} should be centered:`, message.substring(0, 50) + '...');
        }, index * 1000);
    });
    
    // Add to page temporarily for visual testing
    if (document.body) {
        document.body.appendChild(testContainer);
        setTimeout(() => {
            document.body.removeChild(testContainer);
        }, 5000);
    }
}

// Check CSS styles are loaded
function testCSSStyles() {
    console.log('🧪 Testing CSS improvements...');
    
    const styles = ['.optimized-loading', '.no-groups', '.error-state'];
    styles.forEach(selector => {
        const element = document.createElement('div');
        element.className = selector.substring(1);
        document.body.appendChild(element);
        
        const computed = window.getComputedStyle(element);
        const display = computed.display;
        const textAlign = computed.textAlign;
        const justifyContent = computed.justifyContent;
        
        console.log(`📝 ${selector}: display=${display}, textAlign=${textAlign}, justifyContent=${justifyContent}`);
        
        if (display === 'flex' && (textAlign === 'center' || justifyContent === 'center')) {
            console.log(`✅ ${selector} is properly centered`);
        } else {
            console.log(`⚠️ ${selector} might not be centered correctly`);
        }
        
        document.body.removeChild(element);
    });
}

// Run all tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            testSearchPerformance();
            testLoadingMessages();
            testCSSStyles();
        }, 2000);
    });
} else {
    setTimeout(() => {
        testSearchPerformance();
        testLoadingMessages();
        testCSSStyles();
    }, 2000);
}

console.log('🚀 Test script loaded - will run tests in 2 seconds...');
