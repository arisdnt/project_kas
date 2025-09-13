import { SettingItem } from './SettingItem'
import { getSettingsData, type SettingData } from '../data/settingsData'

interface SettingsGridProps {
  onCopyToClipboard: (value: string) => void
}

export function SettingsGrid({ onCopyToClipboard }: SettingsGridProps) {
  const settingsData = getSettingsData()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {settingsData.map((setting: SettingData, index: number) => (
        <SettingItem
          key={index}
          title={setting.title}
          description={setting.description}
          value={setting.value}
          icon={setting.icon}
          category={setting.category}
          badge={setting.badge}
          action={setting.action}
          onClick={() => {
            if (setting.action === 'copy') {
              onCopyToClipboard(String(setting.value))
            }
          }}
        />
      ))}
    </div>
  )
}

export default SettingsGrid