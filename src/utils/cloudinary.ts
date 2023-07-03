import { v2 as cloudinary } from 'cloudinary'
import {
    cloudinaryCloudName,
    cloudinaryAPIKey,
    cloudinaryAPISecret,
} from '../config/index.conf'

cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryAPIKey,
    api_secret: cloudinaryAPISecret,
})



export default cloudinary








