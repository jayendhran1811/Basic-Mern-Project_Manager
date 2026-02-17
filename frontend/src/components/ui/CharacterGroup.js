import React, { useRef } from "react";

const Pupil = ({
    size = 12,
    maxDistance = 5,
    pupilColor = "black",
    forceLookX,
    forceLookY,
    mouseX,
    mouseY
}) => {
    const pupilRef = useRef(null);

    const calculatePupilPosition = () => {
        if (!pupilRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const pupil = pupilRef.current.getBoundingClientRect();
        const pupilCenterX = pupil.left + pupil.width / 2;
        const pupilCenterY = pupil.top + pupil.height / 2;

        const deltaX = mouseX - pupilCenterX;
        const deltaY = mouseY - pupilCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={pupilRef}
            className="rounded-full"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: pupilColor,
                transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                transition: 'transform 0.1s ease-out',
            }}
        />
    );
};

const EyeBall = ({
    size = 48,
    pupilSize = 16,
    maxDistance = 10,
    eyeColor = "white",
    pupilColor = "black",
    isBlinking = false,
    forceLookX,
    forceLookY,
    mouseX,
    mouseY
}) => {
    const eyeRef = useRef(null);

    const calculatePupilPosition = () => {
        if (!eyeRef.current) return { x: 0, y: 0 };

        if (forceLookX !== undefined && forceLookY !== undefined) {
            return { x: forceLookX, y: forceLookY };
        }

        const eye = eyeRef.current.getBoundingClientRect();
        const eyeCenterX = eye.left + eye.width / 2;
        const eyeCenterY = eye.top + eye.height / 2;

        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        return { x, y };
    };

    const pupilPosition = calculatePupilPosition();

    return (
        <div
            ref={eyeRef}
            className="rounded-full flex items-center justify-center transition-all duration-150"
            style={{
                width: `${size}px`,
                height: isBlinking ? '2px' : `${size}px`,
                backgroundColor: eyeColor,
                overflow: 'hidden',
            }}
        >
            {!isBlinking && (
                <div
                    className="rounded-full"
                    style={{
                        width: `${pupilSize}px`,
                        height: `${pupilSize}px`,
                        backgroundColor: pupilColor,
                        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                        transition: 'transform 0.1s ease-out',
                    }}
                />
            )}
        </div>
    );
};

const CharacterGroup = ({
    mouseX,
    mouseY,
    isTyping,
    password,
    showPassword,
    isPurpleBlinking,
    isBlackBlinking,
    isLookingAtEachOther,
    isPurplePeeking,
    purpleRef,
    blackRef,
    yellowRef,
    orangeRef
}) => {
    const calculatePosition = (ref) => {
        if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;
        const deltaX = mouseX - centerX;
        const deltaY = mouseY - centerY;
        return {
            faceX: Math.max(-15, Math.min(15, deltaX / 20)),
            faceY: Math.max(-10, Math.min(10, deltaY / 30)),
            bodySkew: Math.max(-6, Math.min(6, -deltaX / 120))
        };
    };

    const purplePos = calculatePosition(purpleRef);
    const blackPos = calculatePosition(blackRef);
    const yellowPos = calculatePosition(yellowRef);
    const orangePos = calculatePosition(orangeRef);

    const pwdLength = password?.length || 0;

    return (
        <div className="relative w-full max-w-[600px] aspect-[4/3] flex items-end justify-center perspective-1000">
            {/* Purple Character */}
            <div
                ref={purpleRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out border-2 border-white/10 shadow-2xl"
                style={{
                    left: '12%',
                    width: '32%',
                    height: (isTyping || (pwdLength > 0 && !showPassword)) ? '100%' : '90%',
                    backgroundColor: '#7C3AED', // Slightly different purple to distinguish from background
                    borderRadius: '1.5rem 1.5rem 0 0',
                    zIndex: 1,
                    transform: (pwdLength > 0 && showPassword)
                        ? `skewX(0deg)`
                        : (isTyping || (pwdLength > 0 && !showPassword))
                            ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                            : `skewX(${purplePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                }}
            >
                <div
                    className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                    style={{
                        left: (pwdLength > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `35%` : `${25 + purplePos.faceX}%`,
                        top: (pwdLength > 0 && showPassword) ? `10%` : isLookingAtEachOther ? `15%` : `${10 + purplePos.faceY}%`,
                    }}
                >
                    <EyeBall size={20} pupilSize={8} isBlinking={isPurpleBlinking} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
                    <EyeBall size={20} pupilSize={8} isBlinking={isPurpleBlinking} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} />
                </div>
            </div>

            {/* Black Character */}
            <div
                ref={blackRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out border border-white/10 shadow-2xl"
                style={{
                    left: '42%',
                    width: '22%',
                    height: '70%',
                    backgroundColor: '#1F2937', // Steel grey-black for better contrast against deep purples
                    borderRadius: '1rem 1rem 0 0',
                    zIndex: 2,
                    transform: (pwdLength > 0 && showPassword) ? `skewX(0deg)` : isLookingAtEachOther ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)` : `skewX(${blackPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                }}
            >
                <div
                    className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                    style={{
                        left: (pwdLength > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `25%` : `${20 + blackPos.faceX}%`,
                        top: (pwdLength > 0 && showPassword) ? `8%` : isLookingAtEachOther ? `4%` : `${10 + blackPos.faceY}%`,
                    }}
                >
                    <EyeBall size={18} pupilSize={7} isBlinking={isBlackBlinking} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
                    <EyeBall size={18} pupilSize={7} isBlinking={isBlackBlinking} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} />
                </div>
            </div>

            {/* Orange Character */}
            <div
                ref={orangeRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-lg"
                style={{
                    left: '0',
                    width: '42%',
                    height: '45%',
                    zIndex: 3,
                    backgroundColor: '#FF8A50', // More vibrant orange
                    borderRadius: '100% 100% 0 0',
                    transform: `skewX(${orangePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                }}
            >
                <div
                    className="absolute flex gap-[20%] transition-all duration-200 ease-out"
                    style={{
                        left: (pwdLength > 0 && showPassword) ? `20%` : `${35 + (orangePos.faceX || 0)}%`,
                        top: (pwdLength > 0 && showPassword) ? `40%` : `${45 + (orangePos.faceY || 0)}%`,
                        width: '30%'
                    }}
                >
                    <Pupil size={14} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -5 : undefined} />
                    <Pupil size={14} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -5 : undefined} />
                </div>
            </div>

            {/* Yellow Character */}
            <div
                ref={yellowRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-lg"
                style={{
                    left: '55%',
                    width: '25%',
                    height: '52%',
                    backgroundColor: '#FACC15', // Vibrant yellow
                    borderRadius: '50rem 50rem 0 0',
                    zIndex: 2, // Moved behind black character but keep it visible
                    transformOrigin: 'bottom center',
                    transform: `skewX(${yellowPos.bodySkew || 0}deg)`,
                }}
            >
                <div
                    className="absolute flex gap-[20%] transition-all duration-200 ease-out"
                    style={{
                        left: (pwdLength > 0 && showPassword) ? `15%` : `${35 + (yellowPos.faceX || 0)}%`,
                        top: (pwdLength > 0 && showPassword) ? `15%` : `${18 + (yellowPos.faceY || 0)}%`,
                        width: '30%'
                    }}
                >
                    <Pupil size={14} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -5 : undefined} />
                    <Pupil size={14} mouseX={mouseX} mouseY={mouseY} forceLookX={(pwdLength > 0 && showPassword) ? -5 : undefined} />
                </div>
                <div className="absolute w-[60%] h-[3px] bg-[#2D2D2D]/80 rounded-full transition-all duration-200"
                    style={{
                        left: (pwdLength > 0 && showPassword) ? `10%` : `${20 + (yellowPos.faceX || 0)}%`,
                        top: `38%`
                    }}
                />
            </div>
        </div>
    );
};

export { CharacterGroup };
