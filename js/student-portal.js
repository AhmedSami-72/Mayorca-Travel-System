document.addEventListener('DOMContentLoaded', () => {
    // 1) USER DATA
    const user = { 
        name: "MOMEN AHMED MOHAMED MOHAMED ALI", 
        major: "Bachelor Of Engineering (Electrical-Mechatronics) With Honours", 
        matric: "A24KE4027", 
        semester: "4 / 8", 
        status: "A / AKTIF", 
        email: "ahmedmohamed.m@graduate.utm.my", 
        phone: "01125577010", 
        cgpa: "2.29", 
        activity: "26" 
    };

    // 2) DATA BINDING (PORTAL DASHBOARD)
    const bindData = () => {
        const elements = {
            'userName': user.name,
            'userDegree': user.major,
            'userMajor': "Chemical And Energy Engineering",
            'userMatric': user.matric,
            'userSemester': user.semester,
            'userStatus': user.status,
            'userCgpa': user.cgpa,
            'userActivity': user.activity,
            'userAward': "-"
        };

        for (const [id, value] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
        
        // Header/Dropdown sync (available on all pages)
        const dropName = document.getElementById('dropdownName');
        const dropEmail = document.getElementById('dropdownEmail');
        if (dropName) dropName.textContent = user.name;
        if (dropEmail) dropEmail.textContent = user.email;
    };

    bindData();

    // 3) SIDEBAR TOGGLE (FULL HIDE/SHOW)
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-hidden');
    });

    const toggleMenu = (item, submenu) => {
        // Don't toggle submenus if sidebar is hidden
        if (document.body.classList.contains('sidebar-hidden')) return;

        const isOpen = item.classList.contains('open');
        
        if (isOpen) {
            item.classList.remove('open');
            submenu.classList.remove('show');
        } else {
            item.classList.add('open');
            submenu.classList.add('show');
        }
    };

    const navItems = document.querySelectorAll('.nav-item.has-submenu');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;
            
            const submenu = document.getElementById(targetId);
            if (submenu) {
                toggleMenu(item, submenu);
            }
        });
    });

    const innerSubmenuTriggers = document.querySelectorAll('.has-inner-submenu');
    innerSubmenuTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.body.classList.contains('sidebar-hidden')) return;

            const targetId = trigger.getAttribute('data-target');
            if (!targetId) return;
            
            const innerSubmenu = document.getElementById(targetId);
            
            if (innerSubmenu) {
                const isOpen = innerSubmenu.classList.contains('show');
                if (isOpen) {
                    innerSubmenu.classList.remove('show');
                    trigger.querySelector('.submenu-arrow').style.transform = 'rotate(0deg)';
                } else {
                    innerSubmenu.classList.add('show');
                    trigger.querySelector('.submenu-arrow').style.transform = 'rotate(90deg)';
                }
            }
        });
    });

    // 4) PROFILE DROPDOWN
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');

    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && e.target !== profileTrigger) {
            profileDropdown.classList.remove('show');
        }
    });

    // 5) LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    });
});