"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleServerActionResponse } from "@/lib/client-utils";
import { sendLoginname } from "@/lib/server/loginname";
import { LoginSettings } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AutoSubmitForm } from "./auto-submit-form";
import { Translated } from "./translated";

type Inputs = {
  loginName: string;
};

type Props = {
  loginName: string | undefined;
  requestId: string | undefined;
  loginSettings: LoginSettings | undefined;
  organization?: string;
  defaultOrganization?: string;
  suffix?: string;
  submit: boolean;
  allowRegister: boolean;
};

export function UsernameForm({
  loginName,
  requestId,
  organization,
  defaultOrganization,
  suffix,
  loginSettings,
  submit,
  allowRegister,
}: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: { loginName: loginName ?? "" },
  });

  const t = useTranslations("loginname");
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [samlData, setSamlData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const submitLoginName = useCallback(
    async (values: Inputs, organization?: string) => {
      setLoading(true);
      try {
        const res = await sendLoginname({
          loginName: values.loginName,
          organization,
          defaultOrganization,
          requestId,
          suffix,
          ignoreUnknownUsernames: loginSettings?.ignoreUnknownUsernames,
        });
        handleServerActionResponse(res, router, setSamlData, setError);
        return res;
      } catch {
        setError(t("errors.internalError"));
      } finally {
        setLoading(false);
      }
    },
    [defaultOrganization, requestId, suffix, loginSettings, router, t],
  );

  useEffect(() => {
    if (submit && loginName) {
      submitLoginName({ loginName }, organization);
    }
  }, [submit, loginName, organization, submitLoginName]);

  let inputLabel = t("labels.loginname");
  if (loginSettings?.disableLoginWithEmail && loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.username");
  } else if (loginSettings?.disableLoginWithEmail) {
    inputLabel = t("labels.usernameOrPhoneNumber");
  } else if (loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.usernameOrEmail");
  }

  return (
    <>
      {samlData && <AutoSubmitForm url={samlData.url} fields={samlData.fields} />}
      <form className="w-full" onSubmit={handleSubmit((values) => submitLoginName(values, organization))}>
        <Label htmlFor="loginName">{inputLabel}</Label>
        <Input
          id="loginName"
          type="text"
          className="h-12 text-[15px]"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          data-testid="username-text-input"
          {...register("loginName", { required: t("required.loginName") })}
        />

        {error && (
          <div
            className="text-destructive border-destructive bg-destructive/10 mt-3 border-l-2 px-3 py-2 text-sm"
            data-testid="error"
          >
            {error}
          </div>
        )}

        <Button
          data-testid="submit-button"
          type="submit"
          className="mt-6 h-12 w-full text-[13px] font-extrabold tracking-[0.05em] uppercase"
          disabled={loading || !formState.isValid}
        >
          {loading && <Loader2 className="animate-spin" />}
          <Translated i18nKey="submit" namespace="loginname" />
        </Button>

        {allowRegister && (
          <p className="text-muted-foreground mt-5 text-center text-sm">
            <button
              type="button"
              disabled={loading}
              data-testid="register-button"
              className="text-accent font-semibold hover:underline"
              onClick={() => {
                const params = new URLSearchParams();
                if (organization) params.append("organization", organization);
                if (requestId) params.append("requestId", requestId);
                router.push("/register?" + params);
              }}
            >
              <Translated i18nKey="register" namespace="loginname" />
            </button>
          </p>
        )}
      </form>
    </>
  );
}
