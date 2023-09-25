{ pkgs }: {
    deps = [
        pkgs.nodejs-10_x
        pkgs.yarn
        pkgs.nodePackages.typescript-language-server
        pkgs.replitPackages.jest
    ];
}
