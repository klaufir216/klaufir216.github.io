document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdownInput');
  const characterCount = document.getElementById('characterCount');
  const preview = document.getElementById('preview');
  const generateUrlBtn = document.getElementById('generateUrlBtn');
  const generatedUrlInput = document.getElementById('generatedUrl');
  const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
  const maxChars = 1500;
  let timeoutId;

  // Function to update the preview using marked.js
  function updatePreview(markdown) {
    // Normalize backslashes: Convert single `\` to double `\\`
    // so MathJax handles it correctly
    markdown = markdown.replace(/\\/g, '\\\\');
    const htmlContent = marked.parse(markdown);
    preview.innerHTML = htmlContent;
    MathJax.texReset(0);
    MathJax.typesetPromise([preview]).catch((err) => console.log(err));
  }

  // Function to load the markdown from the URL if available
  function loadMarkdownFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const base64Data = params.get('data');
    if (base64Data) {
      const markdown = decodeURIComponent(base64Data); // Decode base64 to markdown
      markdownInput.value = markdown; // Populate the textarea with markdown
      updatePreview(markdown); // Update the preview with the loaded markdown
      const remainingChars = maxChars - markdown.length;
      characterCount.textContent = `${remainingChars} characters remaining.`;
      characterCount.style.color = remainingChars < 0 ? 'red' : 'gray';
    }
  }

  // Load markdown from URL when the page loads
  loadMarkdownFromUrl();

  // Update character count based on input
  markdownInput.addEventListener('input', () => {
    const inputLength = markdownInput.value.length;
    const remainingChars = maxChars - inputLength;

    characterCount.textContent = `${remainingChars} characters remaining.`;

    // Change the color of the character count if it exceeds the limit
    if (remainingChars < 0) {
      characterCount.style.color = 'red';
    } else {
      characterCount.style.color = 'gray';
    }

    // Clear the previous timeout
    clearTimeout(timeoutId);

    // Set a new timeout to update the preview after 2 seconds
    timeoutId = setTimeout(() => {
      updatePreview(markdownInput.value);
    }, 2000);
  });

  // Function to generate the URL
  generateUrlBtn.addEventListener('click', () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("data");
    const markdown = markdownInput.value;
    const base64Encoded = encodeURIComponent(markdown); // Encode markdown in base64
    currentUrl.searchParams.set("data", base64Encoded);
    const url = `${window.location.href}?data=${base64Encoded}`; // Create URL with encoded data
    generatedUrlInput.value = url; // Display generated URL
  });

  document.getElementById("clearUrlBtn").addEventListener("click", () => {
    document.getElementById("generatedUrl").value = ""; // Clear the URL input field
  });

  // Copy the generated URL to clipboard
  copyToClipboardBtn.addEventListener('click', () => {
    generatedUrlInput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
  });

  // Display the current year in the footer
  document.getElementById('currentYear').textContent = new Date().getFullYear();
});

