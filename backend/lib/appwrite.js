import {
    Account,
    Avatars,
    Client,
    Databases,
    ID,
    Query,
    Storage,
    InputFile,
  } from "react-native-appwrite";

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.tip.sol',
    projectId: '673b75b2002d26a0e0f3',
    databaseId: '673b76c900338dd6f5e1',
    userCollectionId: '673b76f500316bf6fa4a',
    photosCollectionId: '673b7710002a02939731',
    storageId: '673b791b0023456a4a07',
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) 
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);


export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw new Error("Account creation failed");
        
        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        );

        return newUser;
    } catch (error) {
        throw new Error(`createUser error: ${error.message}`);
    }  
}

export async function signIn(email, password) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      throw new Error(error);
    }
}

export async function getAccount() {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        throw new Error(`getAccount error: ${error.message}`);
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount();
        
        if (!currentAccount) throw new Error("No current account found");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId, 
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser.documents.length) throw new Error("No user found");
        
        return currentUser.documents[0];
    } catch (error) {
        throw new Error(`getCurrentUser error: ${error.message}`);
    }
}

export async function signOut() {
    try {
      await account.deleteSession('current');
    } catch (error) {
      throw new Error(`signOut error: ${error.message}`);
    }
  }

  export async function uploadFilesToAppwrite(files) {
    if (!files || files.length === 0) return;

    try {
        const uploadedFiles = await Promise.all(files.map(async (file) => {
            const fileData = {
                uri: file.imageUri,
                name: file.name,
                type: file.type,
                size: file.size,
            };

            const uploadedFile = await storage.createFile(
                config.storageId,
                ID.unique(),
                fileData
            );

            return uploadedFile;
        }));

        return uploadedFiles;
    } catch (error) {
        console.error('Error uploading files:', error);
        throw new Error('Failed to upload images. Please try again.');
    }
};
