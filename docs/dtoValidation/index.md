# DTO Validation Service

This utility provides a standardized, service-based approach to validating Data Transfer Objects (DTOs) using the powerful `class-validator` and `class-transformer` libraries.

The `DtoValidation` service abstracts the validation logic, making it easy to ensure that incoming data (e.g., from an API request body) conforms to the expected shape and rules before it's processed by your business logic.

This utility is located at `src/core/shared/utils/validations/dto/index.ts`.

## Core Libraries

-   **`class-validator`**: A library that allows you to use decorator-based validation. You define validation rules directly on the properties of your DTO classes.
-   **`class-transformer`**: A library used to transform plain (literal) JavaScript objects into instances of a class. This step is essential for `class-validator` to be able to recognize and apply the validation decorators.

## `DtoValidation<Tdto>` Service

This is a `typedi` service that implements `IServiceHandlerAsync` to provide a consistent interface for validation.

### How It Works

1.  **Input:** The service's `handleAsync` method receives a plain object (`dto`) and the corresponding DTO class (`dtoClass`) that contains the validation decorators.
2.  **Transform:** It uses `class-transformer`'s `plainToInstance` function to convert the plain object into a true instance of the DTO class.
3.  **Validate:** It uses `class-validator`'s `validateOrReject` function to run all the validation rules defined in the DTO class against the instance.
4.  **Output:**
    -   If validation is successful, it returns an `Ok` result.
    -   If validation fails, it catches the `ValidationError` array, concatenates all the error messages into a single string, and returns an `Err` result containing a `ResultError` with a `400 Bad Request` status code.

## Usage Example

### 1. Define a DTO with Validation Decorators

First, create a DTO class and add validation decorators from `class-validator` to its properties.

```typescript
// src/users/dtos/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

### 2. Use the `DtoValidation` Service

In your controller or service, use the `DtoValidation` service to validate the incoming data.

```typescript
import { DtoValidation } from './dto-validation';
import { CreateUserDto } from './dtos/create-user.dto';
import { Body, Post, JsonController } from 'routing-controllers'; // Example with routing-controllers

@JsonController('/users')
export class UsersController {
  private validationService: DtoValidation<CreateUserDto>;

  constructor() {
    // In a real app, this would be injected by typedi
    this.validationService = new DtoValidation<CreateUserDto>();
  }

  @Post('/')
  async createUser(@Body() body: any) {
    // 1. Validate the incoming body against the DTO
    const validationResult = await this.validationService.handleAsync({
      dto: body,
      dtoClass: CreateUserDto,
    });

    // 2. Check the result
    if (validationResult.isErr()) {
      // The response will be a 400 Bad Request with a detailed error message
      throw {
        statusCode: validationResult.error.statusCode,
        message: validationResult.error.message,
      };
    }

    // 3. If validation passes, proceed with business logic
    const validatedDto = body as CreateUserDto;
    console.log('Validation successful. Creating user:', validatedDto.name);
    // ... logic to create the user
  }
}
```

#### Example Scenarios

-   **Valid Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com"
    }
    ```
    The `validationResult` will be `Ok`, and the controller will proceed.

-   **Invalid Request Body:**
    ```json
    {
      "name": "J",
      "email": "not-an-email"
    }
    ```
    The `validationResult` will be an `Err`, and the error message will be something like: `"name must be longer than or equal to 2 characters, email must be an email"`. The controller will throw a 400 error.
