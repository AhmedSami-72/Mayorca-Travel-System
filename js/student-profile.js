document.addEventListener('DOMContentLoaded', () => {
    // 1) STUDENT DATA
    const studentData = { 
        name: "MOMEN AHMED MOHAMED MOHAMED ALI", 
        matric: "A24KE4027", 
        emailOfficial: "ahmedmohamed.m@graduate.utm.my", 
        emailSecondary: "the.kingmomen@gmail.com", 
        phone: "01125577010", 
        nationality: "Egypt", 
        religion: "Islam",
        entryMode: "-",
        icNo: "202309M10507",
        passportNo: "P00293135",
        dob: "31 Jul 2004",
        stateOfBirth: "PAL-",
        gender: "L-Male",
        marriageStatus: "1-Single",
        race: "N-Kaum Bukan War. Msia",
        disability: "-"
    };

    // 2) DATA BINDING
    const bindProfileData = () => {
        // Basic Info
        const fields = {
            'entryMode': studentData.entryMode,
            'icNo': studentData.icNo,
            'passportNo': studentData.passportNo,
            'contactNo': studentData.phone,
            'dob': studentData.dob,
            'stateOfBirth': studentData.stateOfBirth,
            'gender': studentData.gender,
            'marriageStatus': studentData.marriageStatus,
            'nationality': studentData.nationality,
            'race': studentData.race,
            'religion': studentData.religion,
            'disability': studentData.disability,
            'emailOfficial': studentData.emailOfficial,
            'emailSecondary': studentData.emailSecondary
        };

        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) el.value = value;
        }

        // Header/Dropdown sync
        document.getElementById('dropdownName').textContent = studentData.name;
        document.getElementById('dropdownEmail').textContent = studentData.emailOfficial;
    };

    bindProfileData();

    // 3) MAIN TAB SWITCHING
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // Toggle active button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active panel
            tabPanels.forEach(p => {
                p.classList.remove('active');
                if (p.id === target) {
                    p.classList.add('active');
                }
            });
        });
    });

    // 4) ADDRESS SUB-TAB SWITCHING
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabPanels = document.querySelectorAll('.sub-tab-panel');

    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-subtab');

            // Toggle active sub-button
            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle active sub-panel
            subTabPanels.forEach(p => {
                p.classList.remove('active');
                if (p.id === target) {
                    p.classList.add('active');
                }
            });
        });
    });

    // 5) STUDENT PASS INNER TAB SWITCHING
    const studentPassTabBtns = document.querySelectorAll('.student-pass-tab-btn');
    const studentPassPanels = document.querySelectorAll('.student-pass-panel');

    studentPassTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-pass-tab');

            studentPassTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            studentPassPanels.forEach(p => {
                p.classList.remove('active');
                if (p.id === target) {
                    p.classList.add('active');
                }
            });
        });
    });
});