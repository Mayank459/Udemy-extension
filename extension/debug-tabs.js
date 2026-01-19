// Quick diagnostic script to find the correct tab container
// Run this in the browser console on a Udemy course page

console.log('=== Udemy Tab Container Diagnostic ===');

// Find all possible tab containers
const containers = [
    document.querySelector('.ud-tabs-nav-buttons'),
    document.querySelector('[data-purpose="tab-nav-buttons"]'),
    document.querySelector('.tabs-module--tabs-nav-buttons--R48bp'),
    ...document.querySelectorAll('[role="tablist"]')
];

containers.forEach((container, index) => {
    if (container) {
        console.log(`\nContainer ${index}:`);
        console.log('Element:', container);
        console.log('Class:', container.className);
        console.log('Children:', container.children.length);
        console.log('Visible:', container.offsetWidth > 0 && container.offsetHeight > 0);

        // Log each child
        Array.from(container.children).forEach((child, i) => {
            console.log(`  Child ${i}:`, child.tagName, child.className, child.textContent?.substring(0, 50));
        });
    }
});

// Find the Overview tab specifically
const overviewTab = document.querySelector('button[data-purpose="overview-tab"]');
if (overviewTab) {
    console.log('\n=== Overview Tab Found ===');
    console.log('Element:', overviewTab);
    console.log('Parent:', overviewTab.parentElement);
    console.log('Parent class:', overviewTab.parentElement?.className);
}
