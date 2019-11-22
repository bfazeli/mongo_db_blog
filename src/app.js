'use strict';

const MongoClient = require("mongodb");
const ReadlineSync = require("readline-sync");
require('dotenv').config();

let client;
let db;

async function processSubMenuChoice(subMenuChoice, currentUser, userObjects, userCollection) {
    switch (subMenuChoice) {
        case "1":
            console.log(`\nPrinting articles for user ${currentUser.firstName} ${currentUser.lastName}: `);
            await displayArticlesForAuthor(currentUser._id);
            break;
        case "2":
            await changeFirstName(currentUser._id);
            break;
        case "3":
            await changeLastName(currentUser._id);
            break;
        case "4":
            await changeEmailFor(currentUser._id);
            break;
        default:
            return;
    }

    console.log("Success!");
    userObjects = await userCollection
        .find()
        .toArray();

    return userObjects;
}

async function executeSubmenu(userObjects, mainMenuChoice, userCollection) {
    let subMenuChoice = '';
    do {
        const currentUser = userObjects[mainMenuChoice - 1];
        console.log(`\nUser - ${currentUser.firstName} ${currentUser.lastName}\n`);
        console.log(
            "1) List the articles authored by the user" +
            "\n2) Change first name" +
            "\n3) Change last name" +
            "\n4) Change email" +
            "\nb) Back to Main Menu\n");

        subMenuChoice = (ReadlineSync.question('Please enter your choice: ')).toString().toLowerCase();
        userObjects = await processSubMenuChoice(subMenuChoice, currentUser, userObjects, userCollection);
    } while (subMenuChoice !== 'b');
    return userObjects;
}

async function executeMainMenu() {
    let mainMenuChoice = "";
    client = await MongoClient.connect(process.env.DB_URI, {useUnifiedTopology: true});
    db = client.db(process.env.DB);

    do {
        console.log("Main Menu\n");
        const userCollection = db.collection("users");

        let userObjects = await userCollection
            .find()
            .toArray();
        const users = userObjects
            .map(user => user.firstName + " " + user.lastName);
        for (let i = 0; i < users.length; i++) {
            console.log(`${i + 1}) ${users[i]}`)
        }
        console.log("X) Exit\n");
        mainMenuChoice = (ReadlineSync.question('Please enter your choice: ')).toString().toLowerCase();
        if (mainMenuChoice === "x") {
            break
        }
        userObjects = await executeSubmenu(userObjects, mainMenuChoice, userCollection);
    } while (mainMenuChoice !== 'x');
}

// Main entry point into application
async function run() {
    await executeMainMenu();

    console.log("Goodbye");
    await client.close();
}

async function displayArticlesForAuthor(userId) {
    const articles = await db.collection("articles")
        .find({ author:userId })
        .toArray();
    articles.forEach(article => console.log(article.title));
}

async function changeFirstName(userId) {
    const newName = (ReadlineSync.question('Please enter a new first name: ')).toString();
    return db.collection("users")
        .updateOne({ _id:userId }, {
            $set: {
                firstName:newName
            }
        });
}

async function changeLastName(userId) {
    const newLastName = (ReadlineSync.question('Please enter a new last name: ')).toString();
    return db.collection("users")
        .updateOne({ _id:userId }, {
            $set: {
                lastName:newLastName
            }
        });
}

async function changeEmailFor(userId) {
    const newEmail = (ReadlineSync.question('Please enter a new email address: ')).toString();
    return db.collection("users")
        .updateOne({ _id:userId }, {
            $set: {
                email:newEmail
            }
        });
}

run();