                <label className="flex items-start gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needPiano}
                    onChange={() => handleCheckbox("needPiano")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">피아노 이동</span>
                </label>

                <label className="flex items-center gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needAircon}
                    onChange={() => handleCheckbox("needAircon")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">에어컨 철거 및 운반</span>
                </label>

                <label className="flex items-start gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needHardwoodFloor}
                    onChange={() => handleCheckbox("needHardwoodFloor")}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">강화마루</div>
                    {formData.needHardwoodFloor && (
                      <input
                        type="text"
                        value={formData.hardwoodFloorType}
                        onChange={(e) =>
                          setFormData({ ...formData, hardwoodFloorType: e.target.value })
                        }
                        className="mt-2 w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        placeholder="예: 싱글, 슈퍼싱글, 더블"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needDrilling}
                    onChange={() => handleCheckbox("needDrilling")}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">추가 타공</div>
                    {formData.needDrilling && (
                      <input
                        type="number"
                        value={formData.drillingCount}
                        onChange={(e) =>
                          setFormData({ ...formData, drillingCount: e.target.value })
                        }
                        className="mt-2 w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        placeholder="타공 부위 개수"
                        min="1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needLightRemoval}
                    onChange={() => handleCheckbox("needLightRemoval")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">전등 탈착</span>
                </label>

                <label className="flex items-start gap-2 p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-orange-50">
                  <input
                    type="checkbox"
                    checked={formData.needOtherMaterials}
                    onChange={() => handleCheckbox("needOtherMaterials")}
                    className="w-4 h-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">기타 자재: 책상,의자등</span>
                    {formData.needOtherMaterials && (
                      <input
                        type="text"
                        value={formData.otherMaterialsDesc}
                        onChange={(e) =>
                          setFormData({ ...formData, otherMaterialsDesc: e.target.value })
                        }
                        className="mt-2 w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                        placeholder="책상,의자"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </label>
