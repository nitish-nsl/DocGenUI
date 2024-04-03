document.addEventListener("DOMContentLoaded", function () {
    fetch("static/json/sections.json")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(jsonData => {
            // Do something with the jsonData object
            const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
            const appendAlert = (message, type) => {
                const wrapper = document.createElement('div')
                wrapper.innerHTML = [
                    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
                    `   <div>${message}</div>`,
                    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
                    '</div>'
                ].join('')

                alertPlaceholder.append(wrapper)
            }

            const sections = Object.keys(jsonData);
            const checkboxContainer = document.getElementById('checkboxContainer');
            if (checkboxContainer) { // Check if the container exists
                sections.forEach(section => {
                    const div = document.createElement('div');
                    div.className = 'form-check form-check-inline';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'form-check-input';
                    checkbox.id = section;
                    checkbox.value = section;

                    const label = document.createElement('label');
                    label.className = 'form-check-label';
                    label.htmlFor = section;
                    label.appendChild(document.createTextNode(section));

                    div.appendChild(checkbox);
                    div.appendChild(label);

                    checkboxContainer.appendChild(div);
                });
            } else {
                console.error('Checkbox container not found');
            }
            const submitButton = document.getElementById("genDoc-btn");

            const variableInputsContainer = document.getElementById('variable-inputs');
            document.getElementById('clear-btn').addEventListener('click', function () {
                // Loop through all checkboxes and uncheck them

                // const checkboxes = document.querySelectorAll('.form-check-input');
                // variableInputsContainer.innerHTML = "";
                // checkboxes.forEach(checkbox => {
                //     checkbox.checked = false;
                // });
                // appendAlert('All the selections have been cleared', 'success');
                // if (submitButton.disabled == true) {
                //     submitButton.innerHTML = "Generate Document";
                //     submitButton.disabled = false;
                // }
                location.reload();
            });
            
            document.getElementById("sec-btn").addEventListener('click', function () {
                const uniqueVariables = new Set();
                const checkedSections = [];
                const checkboxes = document.querySelectorAll('.form-check-input');
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        checkedSections.push(checkbox.value);
                        // Get variables for the current section
                        const variables = jsonData[checkbox.value].variables;
                        // Add variables to the set
                        variables.forEach(variable => {
                            uniqueVariables.add(variable);
                        });
                    }
                });

                const uniqueVariablesArray = Array.from(uniqueVariables);
                // console.log('Checked sections:', checkedSections);
                // console.log('Unique variables:', uniqueVariablesArray);
                variableInputsContainer.innerHTML = "";
                // Loop through unique variables and create inputs
                uniqueVariablesArray.forEach(variable => {
                    // Create div for input group
                    const inputGroup = document.createElement('div');
                    inputGroup.className = 'mb-3';

                    // Create label for input
                    const label = document.createElement('label');
                    label.className = 'form-label';
                    label.textContent = variable;
                    inputGroup.appendChild(label);

                    // Create input element
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control';
                    input.name = variable// Convert variable name to lowercase and replace spaces with dashes
                    input.required = true; // Make input required
                    inputGroup.appendChild(input);

                    // Append input group to container
                    variableInputsContainer.appendChild(inputGroup);
                });
                variableInputsContainer.innerHTML += '<label for="exampleFormControlInput1" class="form-label">Number of few shot examples?</label><div class="input-group mb-3 has-validation" ><button class="btn btn-outline-secondary" type="button" id="btn-minus">-</button><input type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1" value="1" name = "num_examples" id="exnum-input" style="max-width: 40px; text-align: center;"><button class="btn btn-outline-secondary" type="button" id="btn-plus">+</button></div>'; // <div class="mx-2">Choose in (1-10) range</div></div>';
                var exNumInput = document.getElementById('exnum-input');
                document.getElementById('btn-plus').addEventListener('click', function (event) {
                    // Get the value of the input field with id 'exNumInput' and parse it to an integer
                    var exNumInput = document.getElementById('exnum-input');
                    if (exNumInput.value < 10) {
                        var k = parseInt(exNumInput.value);

                        // Increment the value
                        k++;

                        // Update the value of the input field
                        exNumInput.value = k;
                    }
                    else {
                        appendAlert("Choose number of examples in range(1-10)", "danger");
                    }
                });
                document.getElementById('btn-minus').addEventListener('click', function (event) {
                    // Get the value of the input field with id 'exNumInput' and parse it to an integer
                    if (exNumInput.value > 1) {
                        var k = parseInt(exNumInput.value);

                        // Increment the value
                        k--;

                        // Update the value of the input field
                        exNumInput.value = k;
                    }
                    else {
                        appendAlert("Choose number of examples in range(1-10)", "danger");
                    }
                });



                // Add event listener for form submission
                document.getElementById('variables-form').addEventListener('submit', function (event) {
                    event.preventDefault(); // Prevent default form submission behavior
                    // You can process the form data here, for example:
                    exNumInput.classList.remove("is-invalid");
                    const formData = new FormData(this);
                    const formDataObject = {};
                    formDataObject.sections = checkedSections;
                    const variablesObject = {};
                    for (const [name, value] of formData) {
                        variablesObject[String(name)] = value;
                    }
                    formDataObject.variables = variablesObject;
                    formDataObject.num_examples = parseInt(exNumInput.value);

                    // Do whatever you need with formDataObject
                    console.log(formDataObject);

                    submitButton.disabled = true;

                    // Add spinner to the submit button
                    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating document...';
                    fetch('http://20.219.94.58:8010/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // Add any additional headers if needed
                        },
                        body: JSON.stringify(formDataObject),
                    })
                        .then(async (response) => {
                            if (response.ok) {
                                console.log("response");
                                const res_body = await response.json();
                                console.log(res_body);
                                submitButton.innerHTML = "Generate Document";
                                submitButton.disabled = false;
                                let doc_div = document.createElement("div");
                                if (res_body.status == 'ok') {
                                    doc_div.innerHTML = `Document is generated. Click <a href=${res_body.file_url}>here</a> to download.`;
                                } else {
                                    doc_div.innerHTML = `There was a problem generating the document. Please try again later.`;
                                }
                                document.getElementById("url-display-div").appendChild(doc_div);
                            } else {
                                let doc_div = document.createElement("div");
                                doc_div.innerHTML = `There was a problem generating the document. Please try again later.`;
                                document.getElementById("url-display-div").appendChild(doc_div);
                                throw new Error('Network response was not ok.');
                            }
                        })
                        .catch(error => {
                            console.error('There was a problem with the fetch operation:', error);
                        });
                });
                // You can further process the checked sections and unique variables here
            });

        })
        .catch(error => {
            console.error('There was a problem fetching the sections file:', error);
        });
});
