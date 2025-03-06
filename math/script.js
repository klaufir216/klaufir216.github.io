document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdownInput');

    const preview = document.getElementById('preview');
    const generatedUrlInput = document.getElementById('generatedUrl');
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');

    let timeoutId;

    // Compression functions

    function bytesToBase64(bytes) {
        return btoa(String.fromCharCode(...bytes));
    }

    function base64ToBytes(str) {
        return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
    }


    function compress(str) {
        var array = (new TextEncoder()).encode(str);
        var compressedArray = fflate.zlibSync(array, {
            level: 9
        });
        var base64string = bytesToBase64(compressedArray);
        return base64string;
    }

    function decompress(base64string) {
        var compressedArray = base64ToBytes(base64string)
        var decompressedArray = fflate.unzlibSync(compressedArray);
        var string = new TextDecoder().decode(decompressedArray);
        return string;
    }
    
    function generateUrl() {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("data");
        const markdown = markdownInput.value;
        const uriEncoded = encodeURIComponent(compress(markdown)); // Encode markdown in base64
        currentUrl.searchParams.set("data", uriEncoded);
        generatedUrlInput.value = currentUrl.toString(); // Display generated URL
    }


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
        const dataParam = params.get('data');
        if (dataParam) {
            const markdown = decompress(decodeURIComponent(dataParam)); // Decode base64 to markdown
            markdownInput.value = markdown; // Populate the textarea with markdown
            updatePreview(markdown); // Update the preview with the loaded markdown
        }
    }

    // Load markdown from URL when the page loads
    loadMarkdownFromUrl();

    // Update character count based on input
    markdownInput.addEventListener('input', () => {
        const inputLength = markdownInput.value.length;
        // Change the color of the character count if it exceeds the limit


        // Clear the previous timeout
        clearTimeout(timeoutId);

        // Set a new timeout to update the preview after 2 seconds
        timeoutId = setTimeout(() => {
            generateUrl();
            updatePreview(markdownInput.value);
        }, 500);
    });

    // Copy the generated URL to clipboard
    copyToClipboardBtn.addEventListener('click', () => {
        generatedUrlInput.select();
        document.execCommand('copy');
        var originalText = copyToClipboardBtn.textContent;
        copyToClipboardBtn.textContent = "Done!";
        setTimeout(() => {
            copyToClipboardBtn.textContent = originalText;
        }, 1000);
    });
});
