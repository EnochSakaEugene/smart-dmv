"use client"

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ name, className = "" }: { name: string; className?: string }) {
  return (
    <input
      type="text"
      name={name}
      className={`border-b border-foreground/30 bg-transparent py-1 text-sm outline-none focus:border-foreground ${className}`}
    />
  )
}

export function SectionB() {
  return (
    <fieldset className="border border-foreground/30 p-4">
      <legend className="px-2 font-bold text-sm text-foreground">
        B. Tell us about yourself
      </legend>
      <div className="flex flex-col gap-3">
        {/* Row 1: Name */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <FormField label="Last Name" className="sm:col-span-2">
            <TextInput name="last_name" />
          </FormField>
          <FormField label="First Name">
            <TextInput name="first_name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Middle Name">
              <TextInput name="middle_name" />
            </FormField>
            <FormField label="Jr./Sr./III, etc.">
              <TextInput name="suffix" />
            </FormField>
          </div>
        </div>

        {/* Row 2: Address */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <FormField label="Address where you live (a mailing only address cannot be used)" className="sm:col-span-8">
            <TextInput name="address" />
          </FormField>
          <FormField label="Apt/Unit #" className="sm:col-span-2">
            <TextInput name="apt_unit" />
          </FormField>
          <FormField label="City & State" className="sm:col-span-2">
            <div className="border-b border-foreground/30 py-1 text-sm text-muted-foreground">Washington, DC</div>
          </FormField>
        </div>

        {/* Row 2b: ZIP */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <FormField label="ZIP Code" className="sm:col-span-2">
            <TextInput name="zip_code" />
          </FormField>
          <div className="sm:col-span-10" />
        </div>

        {/* Row 3: DOB, SSN, Citizen, Gender */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
          <FormField label="Date of Birth" className="sm:col-span-3">
            <div className="flex items-center gap-1">
              <input type="text" name="dob_month" placeholder="MM" maxLength={2} className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-muted-foreground">/</span>
              <input type="text" name="dob_day" placeholder="DD" maxLength={2} className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-muted-foreground">/</span>
              <input type="text" name="dob_year" placeholder="YYYY" maxLength={4} className="w-12 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
            </div>
          </FormField>
          <FormField label="Social Security #" className="sm:col-span-3">
            <TextInput name="ssn" />
          </FormField>
          <FormField label="US Citizen" className="sm:col-span-2">
            <div className="flex items-center gap-3 py-1">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="us_citizen" value="yes" className="accent-foreground" /> Yes
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="us_citizen" value="no" className="accent-foreground" /> No
              </label>
            </div>
          </FormField>
          <FormField label="Gender" className="sm:col-span-4">
            <div className="flex items-center gap-3 py-1">
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="gender" value="male" className="accent-foreground" /> Male
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="gender" value="female" className="accent-foreground" /> Female
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input type="radio" name="gender" value="unspecified" className="accent-foreground" /> Unspecified
              </label>
            </div>
          </FormField>
        </div>

        {/* Row 4: Weight, Height, Hair, Eye, Other names */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
          <FormField label="Weight" className="sm:col-span-2">
            <div className="flex items-center gap-1">
              <TextInput name="weight" className="w-full" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">LBS</span>
            </div>
          </FormField>
          <FormField label="Height" className="sm:col-span-2">
            <div className="flex items-center gap-1">
              <input type="text" name="height_ft" className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-xs text-muted-foreground">FT</span>
              <input type="text" name="height_in" className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-xs text-muted-foreground">IN</span>
            </div>
          </FormField>
          <FormField label="Hair Color" className="sm:col-span-2">
            <TextInput name="hair_color" />
          </FormField>
          <FormField label="Eye Color" className="sm:col-span-2">
            <TextInput name="eye_color" />
          </FormField>
          <FormField label="Other names you have used on a Driver License or ID Card" className="sm:col-span-4">
            <TextInput name="other_names" />
          </FormField>
        </div>

        {/* Row 5: Phone, Email */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <FormField label="Cell Phone" className="sm:col-span-3">
            <div className="flex items-center gap-0.5">
              <span className="text-sm text-muted-foreground">(</span>
              <input type="text" name="cell_area" maxLength={3} className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-sm text-muted-foreground">)</span>
              <TextInput name="cell_phone" className="flex-1" />
            </div>
          </FormField>
          <FormField label="Alternate Phone" className="sm:col-span-3">
            <div className="flex items-center gap-0.5">
              <span className="text-sm text-muted-foreground">(</span>
              <input type="text" name="alt_area" maxLength={3} className="w-8 border-b border-foreground/30 bg-transparent py-1 text-sm text-center outline-none focus:border-foreground" />
              <span className="text-sm text-muted-foreground">)</span>
              <TextInput name="alt_phone" className="flex-1" />
            </div>
          </FormField>
          <FormField label="Text Notification" className="sm:col-span-2">
            <div className="flex items-center gap-2 py-1">
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" name="text_notification" className="h-4 w-4 accent-foreground" />
                Yes
              </label>
              <span className="text-[10px] text-muted-foreground">Standard rates apply</span>
            </div>
          </FormField>
          <FormField label="Email" className="sm:col-span-4">
            <TextInput name="email" />
          </FormField>
        </div>
      </div>
    </fieldset>
  )
}
