import { FastifyInstance } from "fastify";
import { z } from "zod";
import { BadRequestException, ConflictException, ForbiddenException, InternalServerErrorException, UnauthorizedException } from "./http-exception.helper";

export const errorHandler = (app: FastifyInstance) => {
  app.setErrorHandler((error, _, reply) => {
    console.log(error);
    
    if (error instanceof BadRequestException) {
      reply.status(400).send({
        message: 'Bad Request',
        error: error.message,
      });
    }

    if (error instanceof UnauthorizedException) {
      reply.status(401).send({
        message: 'Unauthorized',
        error: error.message,
      });
    }

    if (error instanceof ForbiddenException) {
      reply.status(403).send({
        message: 'Forbidden',
        error: error.message,
      });
    }

    if (error instanceof ConflictException) {
      reply.status(409).send({
        message: 'Conflict',
        error: error.message,
      });
    }

    if (error instanceof InternalServerErrorException) {
      reply.status(500).send({
        message: 'Internal Server Error',
        error: error.message,
      });
    }
    
    if (error.name === 'QueryFailedError') {
      reply.status(400).send({
        message: 'Database query failed',
        error: error.message,
      });
    }
    if (error.name === 'EntityNotFoundError') {
      reply.status(404).send({
        message: 'Entity not found',
        error: error.message,
      });
    }
    
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path,
        message: err.message,
      }));
      reply.status(400).send({ errors: formattedErrors });
    } else {
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
  
}