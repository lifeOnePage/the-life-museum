"use client";
import { getYear, toMonthDay, formatDate } from "../utils/dateUtils";

export default function CardContent({
  activeItem,
  data,
  isEditing,
  displayMode,
  birthDate,
  isEditingBirthDate,
  onDataChange,
  onDisplayModeChange,
  onBirthDateChange,
  onBirthDateFocus,
  onBirthDateBlur,
  isMobile = false,
  mainTitle,
}) {
  const prefix = isMobile ? "lr-mobile" : "lr";

  if (activeItem.kind === "main") {
    return (
      <>
        <div className={`${prefix}-meta ${prefix}-meta--mainTop`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={data.record?.name || ""}
                onChange={(e) => {
                  const newData = {
                    ...data,
                    record: {
                      ...data.record,
                      name: e.target.value,
                    },
                  };
                  onDataChange?.(newData);
                }}
                className={`${prefix}-name`}
                placeholder="레코드의 제목을 입력하세요"
              />
              <input
                type="text"
                value={data.record?.subName || ""}
                onChange={(e) => {
                  const newData = {
                    ...data,
                    record: {
                      ...data.record,
                      subName: e.target.value,
                    },
                  };
                  onDataChange?.(newData);
                }}
                className={`${prefix}-subtitle`}
                placeholder="레코드에 대한 소개를 입력하세요"
              />
            </>
          ) : (
            <>
              <div className={`${prefix}-name`}>{mainTitle}</div>
              {activeItem.subtitle && (
                <div className={`${prefix}-subtitle`}>
                  {activeItem.subtitle}
                </div>
              )}
            </>
          )}
        </div>
        {/* 연도/나이 표시 토글 및 생년월일 입력 */}
        {isEditing && (
          <div className={`${prefix}-display-mode-control`}>
            <div className={`${prefix}-display-mode-row`}>
              <div className={`${prefix}-display-mode-toggle`}>
                <span className={`${prefix}-mode-label`}>연도</span>
                <button
                  type="button"
                  className={`${prefix}-mode-switch ${
                    displayMode === "year" ? "" : "active"
                  }`}
                  onClick={() => {
                    const newMode = displayMode === "year" ? "age" : "year";
                    onDisplayModeChange?.(newMode);
                  }}
                >
                  <span className={`${prefix}-mode-switch-slider`}></span>
                </button>
                <span className={`${prefix}-mode-label`}>나이</span>
              </div>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => {
                  onBirthDateChange?.(e.target.value);
                }}
                onFocus={onBirthDateFocus}
                onBlur={onBirthDateBlur}
                className={`${prefix}-birthdate-input-inline ${
                  displayMode === "age"
                    ? ""
                    : `${prefix}-birthdate-input-hidden`
                }`}
                placeholder={
                  isMobile
                    ? "생년월일 (예: 1949.01.15)"
                    : "출생년도를 입력하세요. (예: 1949)"
                }
                maxLength={10}
                disabled={displayMode !== "age"}
              />
            </div>
          </div>
        )}
        {isEditing ? (
          <>
            <textarea
              value={data.record?.description || ""}
              onChange={(e) => {
                const newData = {
                  ...data,
                  record: {
                    ...data.record,
                    description: e.target.value,
                  },
                };
                onDataChange?.(newData);
              }}
              className={`${prefix}-desc-input`}
              maxLength={150}
              placeholder="이 레코드에 대한 간단한 소개를 적어보세요 (최대 150자)"
            />
            <div className={`${prefix}-char-count`}>
              {(data.record?.description || "").length} / 150
            </div>
          </>
        ) : (
          <p
            className={`${prefix}-card-desc-main`}
            style={{
              marginBottom: "5px",
              borderTop: "none",
            }}
          >
            {activeItem.desc}
          </p>
        )}
      </>
    );
  }

  // Year item content
  return (
    <>
      {isEditing ? (
        <>
          <textarea
            value={
              data.items?.find((item) => item.id === activeItem.id)
                ?.description || ""
            }
            onChange={(e) => {
              const newItems = data.items.map((item) =>
                item.id === activeItem.id
                  ? { ...item, description: e.target.value }
                  : item,
              );
              onDataChange?.({ ...data, items: newItems });
            }}
            className={`${prefix}-desc-input`}
            maxLength={150}
            placeholder="이 순간에 대한 이야기를 자유롭게 적어보세요 (최대 150자)"
          />
          <div className={`${prefix}-char-count`}>
            {
              (
                data.items?.find((item) => item.id === activeItem.id)
                  ?.description || ""
              ).length
            }{" "}
            / 150
          </div>
        </>
      ) : (
        <p>{activeItem.desc}</p>
      )}
      <div className={`${prefix}-meta`}>
        {isEditing ? (
          <textarea
            value={
              data.items?.find((item) => item.id === activeItem.id)?.title || ""
            }
            onChange={(e) => {
              const newItems = data.items.map((item) =>
                item.id === activeItem.id
                  ? { ...item, title: e.target.value }
                  : item,
              );
              onDataChange?.({ ...data, items: newItems });
            }}
            className={`${prefix}-name`}
            rows={2}
            placeholder="이 순간을 표현할 수 있는 제목을 입력하세요"
          />
        ) : (
          <div className={`${prefix}-name`}>
            {activeItem.kind === "year" ? activeItem.event : "최아텍"}
          </div>
        )}
        <div className={`${prefix}-date-location`}>
          {isEditing ? (
            <>
              <input
                type="text"
                value={
                  data.items?.find((item) => item.id === activeItem.id)?.date ||
                  ""
                }
                onChange={(e) => {
                  const newItems = data.items.map((item) =>
                    item.id === activeItem.id
                      ? { ...item, date: e.target.value }
                      : item,
                  );
                  onDataChange?.({ ...data, items: newItems });
                }}
                placeholder="예: 2024.01.15"
                className={`${prefix}-date-input`}
                style={{
                  marginBottom: "4px",
                }}
              />
              <input
                type="text"
                value={
                  data.items?.find((item) => item.id === activeItem.id)
                    ?.location || ""
                }
                onChange={(e) => {
                  const newItems = data.items.map((item) =>
                    item.id === activeItem.id
                      ? { ...item, location: e.target.value }
                      : item,
                  );
                  onDataChange?.({ ...data, items: newItems });
                }}
                placeholder="예: 서울, 파리, 제주도"
                className={`${prefix}-location-input`}
              />
            </>
          ) : (
            <>
              <div className={`${prefix}-date`}>
                {getYear(activeItem.date)}
                {toMonthDay(activeItem.date)}
              </div>
              {activeItem.location && (
                <div className={`${prefix}-location`}>
                  {activeItem.location}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}


