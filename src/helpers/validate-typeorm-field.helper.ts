import { Repository } from "typeorm";

export class ValidateTypeormField {
  static hasField<T>(repository: Repository<any>, field: keyof T): boolean {
    const metadata = repository.metadata;
    return metadata.findColumnWithPropertyName(field as string) !== undefined;
 }
}