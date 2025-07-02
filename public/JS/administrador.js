
document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm');
    const studentTable = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
    const guardianForm = document.getElementById('guardianForm');
    const guardianTable = document.getElementById('guardianTable').getElementsByTagName('tbody')[0];
    const monitorForm = document.getElementById('monitorForm');
    const monitorTable = document.getElementById('monitorTable').getElementsByTagName('tbody')[0];

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('studentName').value;
        const age = document.getElementById('studentAge').value;
        const guardianName = document.getElementById('guardianName').value;
        const course = document.getElementById('course').value;
        const attendanceDate = document.getElementById('attendanceDate').value;
        const attendanceCount = document.getElementById('attendanceCount').value;

        const row = studentTable.insertRow();
        row.insertCell(0).textContent = name;
        row.insertCell(1).textContent = age;
        row.insertCell(2).textContent = guardianName;
        row.insertCell(3).textContent = course;
        row.insertCell(4).textContent = attendanceDate;
        row.insertCell(5).textContent = attendanceCount;
        const actionCell = row.insertCell(6);
        actionCell.innerHTML = `<button class="btn btn-warning btn-sm mr-2">Actualizar</button>
                                <button class="btn btn-danger btn-sm">Eliminar</button>`;

        studentForm.reset();
    });

    guardianForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('guardianFullName').value;
        const id = document.getElementById('guardianId').value;
        const phone = document.getElementById('guardianPhone').value;
        const email = document.getElementById('guardianEmail').value;
        const studentInCharge = document.getElementById('studentInCharge').value;
        const course = document.getElementById('guardianCourse').value;

        const row = guardianTable.insertRow();
        row.insertCell(0).textContent = fullName;
        row.insertCell(1).textContent = id;
        row.insertCell(2).textContent = phone;
        row.insertCell(3).textContent = email;
        row.insertCell(4).textContent = studentInCharge;
        row.insertCell(5).textContent = course;
        const actionCell = row.insertCell(6);
        actionCell.innerHTML = `<button class="btn btn-warning btn-sm mr-2">Actualizar</button>
                                <button class="btn btn-danger btn-sm">Eliminar</button>`;

        guardianForm.reset();
    });

    monitorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('monitorName').value;
        const id = document.getElementById('monitorId').value;
        const phone = document.getElementById('monitorPhone').value;
        const email = document.getElementById('monitorEmail').value;
        const hours = document.getElementById('monitorHours').value;

        const row = monitorTable.insertRow();
        row.insertCell(0).textContent = name;
        row.insertCell(1).textContent = id;
        row.insertCell(2).textContent = phone;
        row.insertCell(3).textContent = email;
        row.insertCell(4).textContent = hours;
        const actionCell = row.insertCell(5);
        actionCell.innerHTML = `<button class="btn btn-warning btn-sm mr-2">Actualizar</button>
                                <button class="btn btn-danger btn-sm">Eliminar</button>`;

        monitorForm.reset();
    });
});