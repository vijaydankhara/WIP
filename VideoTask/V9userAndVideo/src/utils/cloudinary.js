import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

  // Configuration
  cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET
});

const uplodOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
       const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        // File has been uploded successfull
        console.log("File has uploded in cloudinary",response.url);
        return response;
    } catch (error) {
        // remove the local saved temporary file as the upload operation got failer
        fs.unlinkSync(localFilePath)
        return null;
    }
}

 