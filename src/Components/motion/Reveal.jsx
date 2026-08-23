import PropTypes from 'prop-types';
import useInViewReveal from '../../hooks/useInViewReveal';

/**
 * Wrap any block for scroll reveal. Variants: up | left | right | zoom | fade
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  style,
  ...rest
}) {
  const { ref, className: revealClass } = useInViewReveal({ delay });

  return (
    <Tag
      ref={ref}
      className={`${revealClass} reveal--${variant} ${className}`.trim()}
      style={{
        ...(delay ? { '--reveal-delay': `${delay}ms` } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

Reveal.propTypes = {
  children: PropTypes.node,
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(['up', 'left', 'right', 'zoom', 'fade']),
  delay: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
};
