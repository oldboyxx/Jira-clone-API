import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { color } from 'shared/utils/styles';
import Icon from 'shared/components/Icon';

import { StyledButton, StyledSpinner, Text } from './Styles';

const propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(['primary', 'success', 'danger', 'secondary', 'empty']),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  iconSize: PropTypes.number,
  disabled: PropTypes.bool,
  isWorking: PropTypes.bool,
  onClick: PropTypes.func,
};

const defaultProps = {
  className: undefined,
  children: undefined,
  variant: 'secondary',
  icon: undefined,
  iconSize: 18,
  disabled: false,
  isWorking: false,
  onClick: () => {},
};

const Button = forwardRef(
  ({ children, variant, icon, iconSize, disabled, isWorking, onClick, ...buttonProps }, ref) => {
    const handleClick = (e) => {
      if (!disabled && !isWorking) {
        onClick(e);
      }
    };

    return (
      <StyledButton
        {...buttonProps}
        onClick={(e)=> handleClick(e)}
        variant={variant}
        disabled={disabled || isWorking}
        isWorking={isWorking}
        iconOnly={!children}
        ref={ref}
      >
        {isWorking && <StyledSpinner size={26} color={getIconColor(variant)} />}

        {!isWorking && icon && typeof icon === 'string' ? (
          <Icon type={icon} size={iconSize} color={getIconColor(variant)} />
        ) : (
          icon
        )}
        {children && <Text withPadding={isWorking || icon}>{children}</Text>}
      </StyledButton>
    );
  },
);

const getIconColor = variant =>
  ['secondary', 'empty'].includes(variant) ? color.textDark : '#fff';

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;

export default Button;
