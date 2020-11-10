import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { Photo } from "./entity/Photo";
import ormconfig from "../ormconfig";

async function bootstrap() {
    const connection = await createConnection({
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "root",
        password: "root",
        database: "test",
        entities: [
            Photo
        ],
        synchronize: true,
        logging: false
    })
    let photo = new Photo();
    photo.name = "Me and Bears";
    photo.description = "I am near polar bears";
    photo.filename = "photo-with-bears.jpg";
    photo.views = 1;
    photo.isPublished = true;

    await connection.manager.save(photo);
    console.log("Photo has been saved");
    connection.close();
}