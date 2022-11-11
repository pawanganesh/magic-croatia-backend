import express from "express";
import cors from "cors";
import Controller from "interfaces/controller.interface";
import errorMiddleware from "middleware/errorMiddleware";
import AuthService from "services/authService";
import authMiddleware from "middleware/authMiddleware";

class App {
  public app: express.Application;
  public appPort: number = 5000;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();

    // initialize services
    new AuthService();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(authMiddleware);
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }

  public appListen() {
    this.app.listen(this.appPort, () => {
      console.log(`App listening on the port ${this.appPort}`);
    });
  }
}

export default App;
