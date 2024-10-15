import axios from 'axios';
import { Express, Request, Response } from 'express';
import config from './config.json';

const createHandler = (host: string, path: string, method: string) => {
  return async (req: Request, res: Response) => {
    try {
      let url = `${host}${path}`;

      req.params &&
        Object.keys(req.params).forEach((param) => {
          url = url.replace(`:${param}`, req.params[param]);
        });

      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers: {
          origin: 'http://localhost:8081',
        },
      });

      return res.json(data);
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        return res
          .status(error.response?.status || 500)
          .json(error.response?.data);
      }

      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};

// main config
export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([_name, service]) => {
    const hostName = service.url;

    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        const handler = createHandler(hostName, route.path, method);
        const endpoint = `/api${route.path}`;

        app[method](endpoint, handler);
      });
    });
  });
};
