const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Directory to save images
const targetDir = path.join(process.cwd(), 'public/images/plants');

// Make sure the directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// List of plant images to download with their source URLs
// Using Unsplash for free high-quality images
const plantImages = [
  { 
    name: 'fiddle-leaf-fig.jpg', 
    url: 'https://images.unsplash.com/photo-1597912037121-c78742fdc449?w=800&q=80&auto=format' 
  },
  { 
    name: 'basil.jpg', 
    url: 'https://images.unsplash.com/photo-1600689728935-1d91dcc0f6c9?w=800&q=80&auto=format' 
  },
  { 
    name: 'lavender.jpg', 
    url: 'https://images.unsplash.com/photo-1595860425004-35a000c600f4?w=800&q=80&auto=format' 
  },
  { 
    name: 'pothos.jpg', 
    url: 'https://images.unsplash.com/photo-1594057683346-3cedc77787aa?w=800&q=80&auto=format' 
  },
  { 
    name: 'rubber-plant.jpg', 
    url: 'https://images.unsplash.com/photo-1604762525953-f7fbcf45fddb?w=800&q=80&auto=format' 
  },
  { 
    name: 'zz-plant.jpg', 
    url: 'https://images.unsplash.com/photo-1587334207853-3e8e8b2bb4e6?w=800&q=80&auto=format' 
  },
  { 
    name: 'calathea.jpg', 
    url: 'https://images.unsplash.com/photo-1602923668104-8ba5b51a218d?w=800&q=80&auto=format' 
  },
  { 
    name: 'pilea.jpg', 
    url: 'https://images.unsplash.com/photo-1596724878582-76f30a0d99e8?w=800&q=80&auto=format' 
  }
];

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      console.error(`✗ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting download of missing plant images...');
  
  // Check which images already exist
  const existingImages = fs.readdirSync(targetDir);
  const imagesToDownload = plantImages.filter(
    img => !existingImages.includes(img.name)
  );
  
  if (imagesToDownload.length === 0) {
    console.log('All plant images already exist. No downloads needed.');
    return;
  }
  
  console.log(`Downloading ${imagesToDownload.length} missing plant images...`);
  
  for (const image of imagesToDownload) {
    const filePath = path.join(targetDir, image.name);
    try {
      await downloadImage(image.url, filePath);
    } catch (error) {
      console.error(`Failed to download ${image.name}`);
    }
  }
  
  console.log('All downloads completed!');
}

// Execute the download
downloadAllImages().catch(console.error); 