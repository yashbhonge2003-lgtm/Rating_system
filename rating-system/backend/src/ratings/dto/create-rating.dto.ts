import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  storeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  value: number;
}
