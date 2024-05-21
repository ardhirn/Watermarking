document.getElementById('embedMenu').addEventListener('click', function() {
    document.getElementById('embedSection').style.display = 'block';
    document.getElementById('extractSection').style.display = 'none';
});

document.getElementById('extractMenu').addEventListener('click', function() {
    document.getElementById('embedSection').style.display = 'none';
    document.getElementById('extractSection').style.display = 'block';
});

document.getElementById('embedButton').addEventListener('click', embedWatermark);
document.getElementById('extractButton').addEventListener('click', extractWatermark);
document.getElementById('alphaRange').addEventListener('input', function() {
    document.getElementById('alphaValue').textContent = this.value;
});

function embedWatermark() {
    const imageInput = document.getElementById('imageInput');
    const watermarkInput = document.getElementById('watermarkInput');
    const alpha = parseFloat(document.getElementById('alphaRange').value);
    
    if (imageInput.files.length === 0 || watermarkInput.files.length === 0) {
        alert('Please select both an image and a watermark.');
        return;
    }
    
    const image = new Image();
    const watermark = new Image();
    
    image.onload = function() {
        watermark.onload = function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = image.width;
            canvas.height = image.height;
            
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const imgPixels = imageData.data;
            
            ctx.drawImage(watermark, 0, 0, canvas.width, canvas.height);
            const watermarkData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const wmPixels = watermarkData.data;
            
            for (let i = 0; i < imgPixels.length; i += 4) {
                imgPixels[i] = imgPixels[i] + alpha * (wmPixels[i] - 128);     // Red
                imgPixels[i + 1] = imgPixels[i + 1] + alpha * (wmPixels[i + 1] - 128); // Green
                imgPixels[i + 2] = imgPixels[i + 2] + alpha * (wmPixels[i + 2] - 128); // Blue
            }
            
            ctx.putImageData(imageData, 0, 0);
            const watermarkedImageURL = canvas.toDataURL();
            document.getElementById('outputImage').src = watermarkedImageURL;
            document.getElementById('downloadLink').href = watermarkedImageURL;
        };
        
        watermark.src = URL.createObjectURL(watermarkInput.files[0]);
    };
    
    image.src = URL.createObjectURL(imageInput.files[0]);
}

function extractWatermark() {
    const originalImageInput = document.getElementById('originalImageInput');
    const watermarkedImageInput = document.getElementById('watermarkedImageInput');
    const alpha = parseFloat(document.getElementById('alphaRange').value);
    
    if (originalImageInput.files.length === 0 || watermarkedImageInput.files.length === 0) {
        alert('Please select both the original image and the watermarked image.');
        return;
    }
    
    const originalImage = new Image();
    const watermarkedImage = new Image();
    
    watermarkedImage.onload = function() {
        originalImage.onload = function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = watermarkedImage.width;
            canvas.height = watermarkedImage.height;
            
            ctx.drawImage(watermarkedImage, 0, 0);
            const watermarkedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const wmPixels = watermarkedImageData.data;
            
            ctx.drawImage(originalImage, 0, 0);
            const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const origPixels = originalImageData.data;
            
            const extractedWatermarkData = ctx.createImageData(canvas.width, canvas.height);
            const extWmPixels = extractedWatermarkData.data;
            
            for (let i = 0; i < wmPixels.length; i += 4) {
                extWmPixels[i] = clamp((wmPixels[i] - origPixels[i]) / alpha + 128);     // Red
                extWmPixels[i + 1] = clamp((wmPixels[i + 1] - origPixels[i + 1]) / alpha + 128); // Green
                extWmPixels[i + 2] = clamp((wmPixels[i + 2] - origPixels[i + 2]) / alpha + 128); // Blue
                extWmPixels[i + 3] = 255;  // Alpha
            }
            
            ctx.putImageData(extractedWatermarkData, 0, 0);
            document.getElementById('extractedWatermark').src = canvas.toDataURL();
        };
        
        originalImage.src = URL.createObjectURL(originalImageInput.files[0]);
    };
    
    watermarkedImage.src = URL.createObjectURL(watermarkedImageInput.files[0]);
}

function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

