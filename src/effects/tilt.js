function formatTransition ({property, duration, easing}) {
    return `${property} ${duration}ms ${easing}`;
}

export function getEffect ({
    container,
    layers,
    elevation,
    scenePerspective,
    transition,
    perspective,
    translation,
    rotation,
    skewing,
    scaling
}) {
    let layerPerspective = '';

    /*
     * Init effect
     * also set transition if required.
     */
    if (container) {
        const containerStyle = {
            perspective: `${scenePerspective}px`
        };

        if (transition.active && perspective.active) {
            containerStyle.transition = formatTransition({property: 'perspective-origin', ...transition});
        }

        Object.assign(container.style, containerStyle);
    }
    else {
        layerPerspective = `perspective(${scenePerspective}px) `;
    }

    const layerStyle = {
        'pointer-events': 'none'
    };

    if (transition.active) {
        layerStyle.transition = formatTransition({property: 'transform', ...transition});
    }

    layers.forEach(layer => Object.assign(layer.el.style, layerStyle));

    return function tilt ({x, y}) {
        const len = layers.length;

        let translateXFactor;
        let translateYFactor;
        let rotateXFactor;
        let rotateYFactor;
        let skewXFactor;
        let skewYFactor;
        let scaleXFactor;
        let scaleYFactor;

        if (translation.active) {
            translateXFactor = translation.active === 'y'
                ? 0
                : (translation.invertX ? -1 : 1) * translation.max * (2 * x - 1);
            translateYFactor = translation.active === 'x'
                ? 0
                : (translation.invertY ? -1 : 1) * translation.max * (2 * y - 1);
        }

        if (rotation.active) {
            rotateXFactor = rotation.active === 'y'
                ? 0
                : (rotation.invertX ? -1 : 1) * rotation.max * (y * 2 - 1);
            rotateYFactor = rotation.active === 'x'
                ? 0
                : (rotation.invertY ? -1 : 1) * rotation.max * (1 - x * 2);
        }

        if (skewing.active) {
            skewXFactor = skewing.active === 'y'
                ? 0
                : (skewing.invertX ? -1 : 1) * skewing.max * (1 - x * 2);
            skewYFactor = skewing.active === 'x'
                ? 0
                : (skewing.invertY ? -1 : 1) * skewing.max * (1 - y * 2);
        }

        if (scaling.active) {
            scaleXFactor = scaling.active === 'y'
                ? 0
                : (scaling.invertX ? -1 : 1) * scaling.max * (Math.abs(0.5 - x) * 2);
            scaleYFactor = scaling.active === 'x'
                ? 0
                : (scaling.invertY ? -1 : 1) * scaling.max * (Math.abs(0.5 - y) * 2);
        }

        layers.forEach((layer, index) => {
            const depth = (index + 1) / len;

            let translatePart = '';

            const translateZVal = elevation * (index + 1);

            if (translation.active) {
                const translateXVal = translateXFactor * depth;
                const translateYVal = translateYFactor * depth;

                translatePart = `translate3d(${translateXVal}px, ${translateYVal}px, ${translateZVal}px)`;
            }
            else {
                translatePart = `translateZ(${translateZVal}px)`;
            }

            let rotatePart = '';
            if (rotation.active) {
                const rotateXVal = rotateXFactor * depth;
                const rotateYVal = rotateYFactor * depth;

                rotatePart = `rotateX(${rotateXVal}deg) rotateY(${rotateYVal}deg)`;
            }
            else {
                rotatePart = 'rotateX(0deg) rotateY(0deg)';
            }

            let skewPart = '';
            if (skewing.active) {
                const skewXVal = skewXFactor * depth;
                const skewYVal = skewYFactor * depth;

                skewPart = `skew(${skewXVal}deg, ${skewYVal}deg)`;
            }
            else {
                skewPart = 'skew(0deg, 0deg)';
            }

            let scalePart = '';
            if (scaling.active) {
                const scaleXVal = 1 + scaleXFactor * depth;
                const scaleYVal = 1 + scaleYFactor * depth;

                scalePart = `scale(${scaleXVal}, ${scaleYVal})`;
            }
            else {
                scalePart = 'scale(1, 1)';
            }

            layer.el.style.transform = `${layerPerspective}${translatePart} ${scalePart} ${skewPart} ${rotatePart}`;
        });

        if (perspective.active) {
            const perspX = perspective.active === 'y'
                ? 0
                : perspective.invertX ? x : (1 - x);
            const perspY = perspective.active === 'x'
                ? 0
                : perspective.invertY ? y : (1 - y);

            let a = 1, b = 0;

            if (perspective.max) {
                a = 1 + 2 * perspective.max;
                b = perspective.max;
            }

            container.style.perspectiveOrigin = `${(perspX * a - b) * 100}% ${(perspY * a - b) * 100}%`;
        }
        else if (container) {
            container.style.perspectiveOrigin = '50% 50%';
        }
    }
}
