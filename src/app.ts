import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
dotenv.config();

import Controller from 'interfaces/controller.interface';
import errorMiddleware from 'middleware/errorMiddleware';
import AuthService from 'services/authService';

class App {
  public app: express.Application;

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
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }

  public appListen() {
    this.app.listen(process.env.PORT || 5000, () => {
      console.log(`App listening on the port ${process.env.PORT || 5000}`);
    });
  }
}

export default App;
