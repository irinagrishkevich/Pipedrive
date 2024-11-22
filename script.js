const url = 'https://testdeal-sandbox2.pipedrive.com/v1/';
const token = '29f77fcabbfae27b11274fe8a449cd3c5832fe41';

const btn = document.getElementById('submit')
const container = document.getElementsByClassName('form-container')[0]
const saveBtn = document.getElementById('save');


function getFieldValue(selector){
    const el = document.querySelector(selector)
    return el ? el.value : ''
}
function setFieldValue(selector, value){
    const el = document.querySelector(selector)
    if (el) el.value = value || ''
}

function getFormData(){
    return{
        name: getFieldValue('input[name="name"]'),
        lastName: getFieldValue('input[name="lastName"]'),
        phone: getFieldValue('input[name="phone"]'),
        email: getFieldValue('input[name="email"]'),
        job_type: getFieldValue('select[name="job_type"]'),
        job_source: getFieldValue('select[name="job_source"]'),
        job_description: getFieldValue('textarea[name="job_description"]'),
        address: getFieldValue('input[name="address"]'),
        city: getFieldValue('input[name="city"]'),
        state: getFieldValue('input[name="state"]'),
        zip: getFieldValue('input[name="zip"]'),
        area: getFieldValue('select[name="area"]'),
        start_date: getFieldValue('input[name="start_date"]'),
        start_time: getFieldValue('input[name="start_time"]'),
        end_time: getFieldValue('input[name="end_time"]'),
        technician: getFieldValue('select[name="technician"]'),
    }
}

function setFormData(data){
    setFieldValue('input[name="name"]', data.name);
    setFieldValue('input[name="lastName"]', data.lastName);
    setFieldValue('input[name="phone"]', data.phone);
    setFieldValue('input[name="email"]', data.email);
    setFieldValue('select[name="job_type"]', data.job_type);
    setFieldValue('select[name="job_source"]', data.job_source);
    setFieldValue('textarea[name="job_description"]', data.job_description);
    setFieldValue('input[name="address"]', data.address);
    setFieldValue('input[name="city"]', data.city);
    setFieldValue('input[name="state"]', data.state);
    setFieldValue('input[name="zip"]', data.zip);
    setFieldValue('select[name="area"]', data.area);
    setFieldValue('input[name="start_date"]', data.start_date);
    setFieldValue('input[name="start_time"]', data.start_time);
    setFieldValue('input[name="end_time"]', data.end_time);
    setFieldValue('select[name="technician"]', data.technician);
}

saveBtn.addEventListener('click', function () {
    const formDataSave = getFormData();
    localStorage.setItem('formData', JSON.stringify(formDataSave));
    alert('Data saved!');
})

window.addEventListener('load', function () {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const formData = JSON.parse(savedData);
        setFormData(formData)
    }
});

btn.addEventListener("click", function () {
    const formData = getFormData()

    const personData = {
        name: formData.name + ' ' + formData.lastName,
        email: formData.email,
        phone: formData.phone,
    };

    fetch(`${url}persons?api_token=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
    })
        .then(response => response.json())
        .then(person => {
            if (person.success) {
                const personId = person.data.id;
                fetchDealFieldsAndCreateDeal(personId, formData);
            } else {
                console.error('Error creating person:', person.error);
            }
        })
        .catch(error => console.error('Error creating person:', error));

    function checkIfFieldExists(fieldName, callback) {
        fetch(`${url}dealFields?api_token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                const existingField = data.data.find(field => field.name === fieldName);
                callback(existingField); // Return the existing field if found
            })
            .catch(error => console.error('Error fetching deal fields:', error));
    }

    const customFields = [
        { name: 'Job Type', field_type: 'text' },
        { name: 'Job Source', field_type: 'text' },
        { name: 'Job Description', field_type: 'text' },
        { name: 'Address', field_type: 'text' },
        { name: 'City', field_type: 'text' },
        { name: 'State', field_type: 'text' },
        { name: 'Zip', field_type: 'text' },
        { name: 'Area', field_type: 'text' },
        { name: 'Start Date', field_type: 'date' },
        { name: 'Start Time', field_type: 'time' },
        { name: 'End Time', field_type: 'time' },
        { name: 'Technician', field_type: 'text' },
    ];

    customFields.forEach(field => createCustomField(field));
    function createCustomField(field) {
        checkIfFieldExists(field.name, existingField => {
            if (existingField) {
                console.log(`Field "${field.name}" already exists with ID: ${existingField.id}`);
            } else {
                fetch(`${url}dealFields?api_token=${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(field),
                })
                    .then(response => response.json())
                    .then(data => console.log(`Custom field created: ${data.data.name}`))
                    .catch(error => console.error('Error creating custom field:', error));
            }
        });
    }


    function fetchDealFieldsAndCreateDeal(personId, formData) {
        fetch(`${url}dealFields?api_token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const fieldKeyMap = {};
                    data.data.forEach(field => {
                        fieldKeyMap[field.name] = field.key;
                    });

                    createDeal(personId, fieldKeyMap, formData);

                } else {
                    console.error('Error fetching deal fields:', data.error);
                }
            })
            .catch(error => console.error('Error fetching deal fields:', error));
    }


    function createDeal(personId, fieldKeyMap, formData) {
        const dealData = {
            title: 'WorkizZ',
            person_id: personId,
            [fieldKeyMap['Job Type']]: formData.job_type,
            [fieldKeyMap['Job Source']]: formData.job_source,
            [fieldKeyMap['Job Description']]: formData.job_description,
            [fieldKeyMap['Address']]: formData.address,
            [fieldKeyMap['City']]: formData.city,
            [fieldKeyMap['State']]: formData.state,
            [fieldKeyMap['Zip']]: formData.zip,
            [fieldKeyMap['Area']]: formData.area,
            [fieldKeyMap['Start Date']]: formData.start_date,
            [fieldKeyMap['Start Time']]: formData.start_time,
            [fieldKeyMap['End Time']]: formData.end_time,
            [fieldKeyMap["Technician"]]: formData.technician,
        };


        btn.classList.add('loader-btn')
        document.getElementById('btn-text').innerHTML = 'Request is send'
        container.style.opacity = '0.3'
        document.getElementById('loader').style.display = 'block'

        fetch(`${url}deals?api_token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dealData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Deal created successfully!');
                    btn.classList.remove('loader-btn')
                    document.getElementById('btn-text').innerHTML = 'Create a job'
                    document.getElementById('loader').style.display = 'none'
                    container.style.opacity = '1'

                    container.innerHTML = '<p>Job is ' +
                        'created successfully! <a href="https://testdeal-sandbox2.pipedrive.com/deals/' +
                        data.data.id + '">View deal</a></p>'
                    container.classList.add('success')
                    localStorage.removeItem('formData')
                } else {
                    console.error('Error creating deal:', data.error);
                }
            })
            .catch(error => console.error('Error creating deal:', error));
    }
});






