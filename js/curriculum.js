/**
 * Curriculum Structure Accordion Logic
 * Simplified toggle without processing loader or delays
 */

function toggleSection(el) {
    const parent = el.closest('.accordion-section');
    const content = parent.querySelector('.section-content');
    const icon = el.querySelector('.icon');

    // Toggle active class on parent
    const isActive = parent.classList.contains('active');

    // Close all other sections (Optional - as per requirements)
    document.querySelectorAll('.accordion-section').forEach(sec => {
        if (sec !== parent) {
            sec.classList.remove('active');
            const otherIcon = sec.querySelector('.icon');
            if (otherIcon) otherIcon.textContent = '+';
        }
    });

    // Toggle current
    if (isActive) {
        parent.classList.remove('active');
        icon.textContent = '+';
    } else {
        parent.classList.add('active');
        icon.textContent = '-';
    }
}

// Ensure the modal is hidden on load
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('processing-modal');
    if (modal) modal.style.display = 'none';
});