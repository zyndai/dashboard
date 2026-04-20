"use client";

interface AnimatedButtonProps {
  href: string;
  text: string;
  target?: string;
  small?: boolean;
  discordIcon?: boolean;
  dataWId?: string;
  style?: React.CSSProperties;
}

export function AnimatedButton({
  href,
  text,
  target = "_blank",
  small = false,
  discordIcon = false,
  dataWId,
  style,
}: AnimatedButtonProps): React.ReactElement {
  return (
    <a
      href={href}
      target={target}
      className={`button${small ? " button-small" : ""} z-inline-block`}
      {...(dataWId ? { "data-w-id": dataWId } : {})}
      style={style}
    >
      <div className="button-an-w">
        <div className="button-an-c">
          <div className="button-an-b">
            <div className="button-an-light-c">
              <div className="button-an-light-b" />
            </div>
          </div>
        </div>
      </div>
      <div className="button-an-w-2">
        <div className="button-an-c"></div>
      </div>
      <div className="button-bg"></div>
      <div className="button-c">
        <div className="button-text-b">
          <div className="button-text-e">{text}</div>
        </div>
        {discordIcon ? (
          <div className="button-img-b-discord">
            <div className="button-icon z-embed">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 512 391"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M433.431 32.3505C400.798 17.3775 365.804 6.34551 329.215 0.026513C328.549 -0.095487 327.883 0.209513 327.54 0.818513C323.039 8.82351 318.054 19.2655 314.563 27.4735C275.21 21.5815 236.058 21.5815 197.512 27.4735C194.02 19.0835 188.854 8.82351 184.333 0.818513C183.99 0.229513 183.324 -0.075487 182.658 0.026513C146.09 6.32451 111.096 17.3565 78.4418 32.3505C78.1588 32.4725 77.9168 32.6755 77.7558 32.9395C11.3798 132.105 -6.80425 228.833 2.11575 324.361C2.15575 324.828 2.41875 325.275 2.78175 325.56C46.5748 357.721 88.9967 377.245 130.63 390.187C131.296 390.39 132.002 390.147 132.426 389.598C142.274 376.149 151.053 361.968 158.58 347.055C159.024 346.182 158.6 345.144 157.692 344.799C143.767 339.517 130.508 333.077 117.753 325.764C116.744 325.175 116.663 323.731 117.592 323.04C120.276 321.029 122.961 318.937 125.524 316.824C125.988 316.438 126.634 316.357 127.179 316.6C210.971 354.857 301.686 354.857 384.489 316.6C385.034 316.336 385.68 316.418 386.164 316.803C388.728 318.916 391.412 321.029 394.116 323.04C395.044 323.731 394.983 325.174 393.975 325.763C381.22 333.219 367.961 339.517 354.016 344.779C353.108 345.124 352.704 346.18 353.149 347.053C360.838 361.945 369.617 376.127 379.283 389.577C379.687 390.146 380.413 390.39 381.079 390.186C422.914 377.245 465.336 357.72 509.129 325.559C509.513 325.275 509.755 324.848 509.795 324.381C520.471 213.94 491.914 118.005 434.095 32.9595C433.955 32.6755 433.713 32.4725 433.431 32.3505ZM171.095 266.194C145.868 266.194 125.081 243.034 125.081 214.59C125.081 186.147 145.464 162.986 171.095 162.986C196.926 162.986 217.512 186.35 217.108 214.59C217.108 243.034 196.724 266.194 171.095 266.194ZM341.222 266.194C315.996 266.194 295.209 243.034 295.209 214.59C295.209 186.147 315.592 162.986 341.222 162.986C367.054 162.986 387.639 186.35 387.236 214.59C387.236 243.034 367.055 266.194 341.222 266.194Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="button-img-b">
            <img
              src="/assets/images/button-arrow.svg"
              loading="lazy"
              alt="Arrow"
              className="button-img-e"
            />
          </div>
        )}
      </div>
    </a>
  );
}
