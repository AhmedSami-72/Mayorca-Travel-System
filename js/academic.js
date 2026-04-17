document.addEventListener('DOMContentLoaded', () => {
    // 1) COMPREHENSIVE SUBJECTS DATA
    const subjectsData = {
        'year-1': {
            'sem-1': {
                status: 'Completed',
                subjects: [
                    { code: 'SKEE 1012', name: 'Introduction to Electrical Engineering' },
                    { code: 'SKEE 1013', name: 'Electrical Circuit Analysis' },
                    { code: 'SKEE 1033', name: 'Scientific Programming' },
                    { code: 'SSCE 1693', name: 'Engineering Mathematics I' },
                    { code: 'SKEE 1233', name: 'Digital Electronic Systems' },
                    { code: 'ULRS 1032', name: 'Integrity and Anti-Corruption' }
                ]
            },
            'sem-2': {
                status: 'Completed',
                subjects: [
                    { code: 'SEMU 2113', name: 'Engineering Science' },
                    { code: 'SKEE 1073', name: 'Electronic Devices and Circuits' },
                    { code: 'SKEE 1103', name: 'C Programming for Engineers' },
                    { code: 'SKEE 2133', name: 'Electronic Instrumentation' },
                    { code: 'SSCE 1793', name: 'Differential Equations' },
                    { code: 'UHLM 1012', name: 'Malay Language Communication' },
                    { code: 'ULRS 1182', name: 'Ethics and Civilization' }
                ]
            }
        },
        'year-2': {
            'sem-1': {
                status: 'Completed',
                subjects: [
                    { code: 'SKEE 2073', name: 'Signal and Systems' },
                    { code: 'SKEE 2433', name: 'Principles of Electrical Power Systems' },
                    { code: 'SKEE 2752', name: 'Electronic Design Laboratory' },
                    { code: 'SKEE 3223', name: 'Microprocessor' },
                    { code: 'SSCE 2193', name: 'Engineering Statistics' },
                    { code: 'SSCE', name: 'Engineering Mathematics II' }
                ]
            },
            'sem-2': {
                status: 'Pending',
                subjects: []
            }
        },
        'year-3': {
            'sem-1': { status: 'Pending', subjects: [] },
            'sem-2': { status: 'Pending', subjects: [] }
        },
        'year-4': {
            'sem-1': { status: 'Pending', subjects: [] },
            'sem-2': { status: 'Pending', subjects: [] }
        }
    };

    const advisorData = [
        { id: 1, session: '202520262', programme: 'SETNH', semNo: '4', staffNo: '16287', name: 'DR. KHAIRULNADZMI BIN JAMALUDDIN', faculty: 'FKT', contact: 'khairulnadzmi@utm.my' },
        { id: 2, session: '202520261', programme: 'SETNH', semNo: '3', staffNo: '16287', name: 'DR. KHAIRULNADZMI BIN JAMALUDDIN', faculty: 'FKT', contact: 'khairulnadzmi@utm.my' },
        { id: 3, session: '202420252', programme: 'SETNH', semNo: '2', staffNo: '16287', name: 'DR. KHAIRULNADZMI BIN JAMALUDDIN', faculty: 'FKT', contact: 'khairulnadzmi@utm.my' },
        { id: 4, session: '202420251', programme: 'SETNH', semNo: '1', staffNo: '16287', name: 'DR. KHAIRULNADZMI BIN JAMALUDDIN', faculty: 'FKT', contact: 'khairulnadzmi@utm.my' }
    ];

    // 2) STATE MANAGEMENT
    const state = {
        currentYear: null,
        currentSem: null,
        advisor: {
            data: advisorData,
            filtered: [...advisorData],
            currentPage: 1,
            entriesPerPage: 10,
            search: ''
        }
    };

    // 3) DOM ELEMENTS
    const steps = document.querySelectorAll('.step');
    const sections = document.querySelectorAll('.tab-section');
    const modal = document.getElementById('processing-modal');

    // Explorer Levels
    const yearLevel = document.getElementById('year-level');
    const semesterLevel = document.getElementById('semester-level');
    const subjectLevel = document.getElementById('subject-level');

    // Breadcrumbs
    const yearPath = document.getElementById('year-path');
    const semPath = document.getElementById('sem-path');

    // 4) HIERARCHICAL NAVIGATION LOGIC
    const showLoading = (callback) => {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.display = 'none';
            if (callback) callback();
        }, 600);
    };

    const hideAllLevels = () => {
        yearLevel.classList.add('hidden');
        semesterLevel.classList.add('hidden');
        subjectLevel.classList.add('hidden');
    };

    const updateSemesterStatuses = (year) => {
        const semesterGrid = semesterLevel.querySelector('.explorer-grid');
        semesterGrid.innerHTML = '';
        
        [1, 2].forEach(sem => {
            const semData = subjectsData[`year-${year}`][`sem-${sem}`];
            const statusClass = semData.status.toLowerCase().replace(' ', '-');
            
            const div = document.createElement('div');
            div.className = `explorer-item semester-item ${statusClass}`;
            div.setAttribute('data-sem', sem);
            div.innerHTML = `
                <span class="explorer-icon">📂</span>
                <span class="item-name">Semester ${sem}</span>
                <span class="status-badge ${statusClass}">${semData.status}</span>
            `;
            
            div.addEventListener('click', () => {
                state.currentSem = sem;
                semPath.textContent = `Year ${state.currentYear} > Semester ${sem}`;
                showLoading(() => {
                    renderSubjects();
                    hideAllLevels();
                    subjectLevel.classList.remove('hidden');
                });
            });
            
            semesterGrid.appendChild(div);
        });
    };

    // Level 1: Click Year
    document.querySelectorAll('.year-item').forEach(item => {
        item.addEventListener('click', () => {
            const year = item.getAttribute('data-year');
            state.currentYear = year;
            yearPath.textContent = `Year ${year}`;
            
            showLoading(() => {
                updateSemesterStatuses(year);
                hideAllLevels();
                semesterLevel.classList.remove('hidden');
            });
        });
    });

    // Back Buttons
    document.getElementById('back-to-years').addEventListener('click', () => {
        showLoading(() => {
            hideAllLevels();
            yearLevel.classList.remove('hidden');
        });
    });

    document.getElementById('back-to-semesters').addEventListener('click', () => {
        showLoading(() => {
            hideAllLevels();
            semesterLevel.classList.remove('hidden');
        });
    });

    const renderSubjects = () => {
        const container = document.getElementById('subject-container');
        container.innerHTML = '';
        
        const yearKey = `year-${state.currentYear}`;
        const semKey = `sem-${state.currentSem}`;
        const semData = subjectsData[yearKey][semKey];
        const subjects = semData.subjects;

        if (!subjects || subjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state-explorer">
                    <span class="empty-icon">📁</span>
                    <p>No subjects found for Year ${state.currentYear} Semester ${state.currentSem}.</p>
                    <span class="status-badge pending">Status: Pending</span>
                </div>
            `;
            return;
        }

        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `
                <div class="subject-info">
                    <span class="subject-code">${subject.code}</span>
                    <span class="subject-name">${subject.name}</span>
                </div>
                <span class="subject-status completed">Completed</span>
            `;
            container.appendChild(card);
        });
    };

    // 5) ADVISOR TABLE LOGIC
    const renderAdvisorTable = () => {
        const tbody = document.querySelector('#advisor-table tbody');
        const pagination = document.getElementById('advisor-pagination');
        const info = document.getElementById('advisor-table-info');
        
        const { filtered, currentPage, entriesPerPage } = state.advisor;
        
        const totalEntries = filtered.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
        
        const currentData = filtered.slice(startIndex, endIndex);

        tbody.innerHTML = '';
        if (currentData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">No records found</td></tr>`;
        } else {
            currentData.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.session}</td>
                    <td>${row.programme}</td>
                    <td>${row.semNo}</td>
                    <td>${row.staffNo}</td>
                    <td>${row.name}</td>
                    <td>${row.faculty}</td>
                    <td>${row.contact}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        info.textContent = `Showing ${totalEntries > 0 ? startIndex + 1 : 0} to ${endIndex} of ${totalEntries} entries`;

        // Pagination
        pagination.innerHTML = '';
        const prevBtn = document.createElement('button');
        prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.textContent = 'Previous';
        prevBtn.onclick = () => { if(currentPage > 1) { state.advisor.currentPage--; renderAdvisorTable(); } };
        pagination.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => { state.advisor.currentPage = i; renderAdvisorTable(); };
            pagination.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = `pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`;
        nextBtn.textContent = 'Next';
        nextBtn.onclick = () => { if(currentPage < totalPages) { state.advisor.currentPage++; renderAdvisorTable(); } };
        pagination.appendChild(nextBtn);
    };

    const handleAdvisorFilter = () => {
        const searchTerm = state.advisor.search.toLowerCase();
        state.advisor.filtered = advisorData.filter(item => 
            Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm))
        );
        state.advisor.currentPage = 1;
        renderAdvisorTable();
    };

    // 6) TAB SWITCHING (STEPPER)
    steps.forEach(step => {
        step.addEventListener('click', () => {
            const targetTab = step.getAttribute('data-tab');
            const targetSection = document.getElementById(`${targetTab}-section`);

            if (!targetSection) return;

            showLoading(() => {
                steps.forEach(s => s.classList.remove('active'));
                sections.forEach(sec => sec.classList.remove('active'));
                step.classList.add('active');
                targetSection.classList.add('active');
                
                if (targetTab === 'advisor') {
                    renderAdvisorTable();
                } else if (targetTab === 'semester') {
                    hideAllLevels();
                    yearLevel.classList.remove('hidden');
                }
            });
        });
    });

    // 6.1) QUALIFICATION SUB-TABS LOGIC
    const subTabs = document.querySelectorAll('.sub-tab');
    const spmContent = document.getElementById('spm-content');
    const otherContent = document.getElementById('other-qualification-content');

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const subType = tab.getAttribute('data-sub');
            
            showLoading(() => {
                subTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (subType === 'spm') {
                    spmContent.classList.add('active');
                    otherContent.classList.remove('active');
                } else {
                    spmContent.classList.remove('active');
                    otherContent.classList.add('active');
                }
            });
        });
    });

    // Entries and Search Listeners for Advisor
    const advisorEntries = document.getElementById('advisor-entries');
    if (advisorEntries) {
        advisorEntries.addEventListener('change', (e) => {
            state.advisor.entriesPerPage = parseInt(e.target.value);
            state.advisor.currentPage = 1;
            renderAdvisorTable();
        });
    }

    const advisorSearch = document.getElementById('advisor-search');
    if (advisorSearch) {
        advisorSearch.addEventListener('input', (e) => {
            state.advisor.search = e.target.value;
            handleAdvisorFilter();
        });
    }

    // 7) INITIAL RENDER
    hideAllLevels();
    yearLevel.classList.remove('hidden');
});