import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface AmountValidatorParams {
  availableAmount?: number;
  maxAmount?: number;
  minAmount?: number;
}

export class CustomValidators {

  static amount(params: AmountValidatorParams): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const {availableAmount, minAmount, maxAmount} = params;
      const num = control.value;

      if (num < minAmount) {
        return {min: true};
      }

      if (num > maxAmount) {
        return {max: true};
      }

      if (num > availableAmount) {
        return {notEnough: true};
      }

      return null;
    };
  }

}
