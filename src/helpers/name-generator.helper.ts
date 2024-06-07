import pluralize from 'pluralize';

export class NameGenerator {
  static singuralPlural(name: string): {
    singular: string,
    plural: string
  } {
    return {
      singular: pluralize.singular(name).toLowerCase(),
      plural: pluralize.plural(name).toLowerCase()
    }
  }
}