document.addEventListener("DOMContentLoaded", function() {
    const copyButton = document.getElementById('copy-button');

copyButton.addEventListener('click', function() {
    const docDivContent = document.getElementById('doc-div').textContent;
    
    // Create a textarea element and set its value to the content of doc-div
    const textarea = document.createElement('textarea');
    textarea.value = docDivContent;
    textarea.setAttribute('readonly', ''); // Make it readonly to prevent user input
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px'; // Move it off-screen

    document.body.appendChild(textarea);
    textarea.select(); // Select the textarea's content

    // Copy the selected content to the clipboard
    document.execCommand('copy');

    document.body.removeChild(textarea); // Remove the textarea from the DOM
    alert('Content copied to clipboard!');
});
});