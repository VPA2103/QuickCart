import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

//inngest function to save user to a database
export const syncUserCreation = inngest.createFunction(
    {
        id:'sync-user-from-clerk'
    },
    {
        event:'clerk/user.created'
    },

    // async ({event}) =>{
    //     const {id,first_name,last_name,email_address,image_url} = event.data

    //     const userData = {
    //         _id:id,
    //         email: Array.isArray(email_address)?email_address[0]:email_address,
    //         name:first_name + ' ' + last_name,
    //         imageUrl: image_url,

    //     }
    //     await connectDB()
    //     await User.create(userData)

    // }
    async ({ event }) => {
        console.log("Received event data:", event.data);

        const { id, first_name, last_name, email_address, image_url } = event.data;

        const userData = {
            _id: String(id),
            email: Array.isArray(email_address) && email_address.length > 0 ? email_address[0] : "",
            name: `${first_name} ${last_name}`,
            imageUrl: image_url,
        };

        try {
            await connectDB();
            console.log("Connected to MongoDB!");

            await User.findOneAndUpdate(
                { _id: id }, 
                userData, 
                { upsert: true, new: true }
            );
            
            console.log("User created/updated successfully:", userData);
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
)

//inngest function to update user in a database

export const syncUserUpdation = inngest.createFunction(
    {
        id:'update-user-from-clerk'
    },
    {event: 'clerk/user.updated'},
    async ({event}) => {
        const {id,first_name,last_name,email_address,image_url} = event.data

        const userData = {
            _id:id,
            email: Array.isArray(email_address)?email_address[0]:email_address,
            name:first_name + ' ' + last_name,
            imageUrl: image_url,

        }
        await connectDB()
        await User.findByIdAndUpdate(id,userData)

    }
)

//inngest function to delete user from a database

export const syncUserDeletion = inngest.createFunction(
    {
        id:'delete-user-from-clerk'
    },
    {event: 'clerk/user.deleted'},
    async ({event}) => {

        try{
            await connectDB()
            const {id} = event.data
            await User.findByIdAndDelete(id)
            console.log(`User with id ${id} deleted`)
        }catch(error){
            console.log("Error deleting user",error)
        }
        
    }
)







