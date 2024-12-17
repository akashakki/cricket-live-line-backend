// Import Cloudinary SDK
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dlokrlj7n',
    api_key: '757671257582237',
    api_secret: 'vwjtabLqK__eRUj6sh9YzoxSGIo'
});

/**
 * Function to upload an image to Cloudinary
 * @param {string} filePath - The local path of the image to upload
 * @param {object} options - Additional options for the upload (e.g., folder, transformations)
 * @returns {Promise<object>} - Resolves with the Cloudinary response object
 */
const uploadImage = async (filePath, options = {}) => {
    try {
        // Ensure folder hierarchy exists by including it in the options
        if (options.folder) {
            const folderParts = options.folder.split('/');
            let currentPath = '';

            for (const part of folderParts) {
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                // Creating folders is implicit in Cloudinary
                // By referencing the folder path during upload, Cloudinary will auto-create it if it doesn't exist
            }
        }

        // Upload the image to the specified folder
        const result = await cloudinary.uploader.upload(filePath, options);
        // console.log('Image uploaded successfully:', result);
        return result;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};


// Example usage
// (async () => {
//     try {
//         const filePath = 'path/to/your/image.jpg'; // Replace with your image file path
//         const options = {
//             folder: 'my_folder', // Optional: Specify a folder in Cloudinary
//             use_filename: true, // Optional: Use the original file name
//             unique_filename: false // Optional: Prevent Cloudinary from renaming the file
//         };

//         const response = await uploadImage(filePath, options);
//         console.log('Uploaded image details:', response);
//     } catch (error) {
//         console.error('Upload failed:', error);
//     }
// })();

module.exports = { uploadImage };
