import "reflect-metadata";
import { createConnection } from "typeorm";
import { Photo } from "./entity/Photo";
async function demo() {
    const connection = await createConnection()

    let photo = new Photo();
    photo.name = "photo name";
    photo.description = "photo description";
    photo.filename = "photo filename";
    photo.views = 1;
    photo.isPublished = true;

    await connection.manager.save(photo);

    console.log("Photo has been saved");

    connection.close();
}

demo()