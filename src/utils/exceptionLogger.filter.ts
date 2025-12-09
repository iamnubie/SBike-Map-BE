import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

@Catch()
export class ExceptionLoggerFilter extends BaseExceptionFilter {
    catch (exception: any, host: ArgumentsHost) {
        console.log('Exception caught by ExceptionLoggerFilter:', exception);
        super.catch(exception, host);
    }
}